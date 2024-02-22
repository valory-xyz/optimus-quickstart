require("dotenv").config();

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  Notification,
  ipcMain
} = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const url = require('url');
const os = require('os');
const next = require('next');
const http = require('http');

const { isDockerRunning } = require("./docker");
const { isInstalled, setupDarwin, setupUbuntu, OperateCmd, OperateDirectory } = require("./install");



// Attempt to acquire the single instance lock
const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) app.quit();

const platform = os.platform()
const isDev = process.env.NODE_ENV === "development";
const appConfig = {
  width: 600,
  height: 800,
  ports: {
    dev: {
      operate: 8000,
      next: 3000,
    },
    prod: {
      operate: 8000, // TOFIX
      next: 8234,
    }
  }
}

let tray, mainWindow, splashWindow, operateDaemon, operateDaemonPid, nextAppProcess, nextAppProcessPid;
let beforeQuitOnceCheck = false;

async function beforeQuit() {
  if (beforeQuitOnceCheck) return;
  beforeQuitOnceCheck = true;

  await new Promise(function (resolve, reject) {
    try {
      process.kill(operateDaemonPid, "SIGKILL");
      resolve(true)
    } catch (error) {
      resolve(false)
    }
  })

  if (nextAppProcessPid) {
    await new Promise(function (resolve, reject) {
      try {
        process.kill(nextAppProcessPid, "SIGKILL");
        resolve(true)
      } catch (error) {
        resolve(false)
      }
    })
  }

  tray && tray.destroy();
  mainWindow && mainWindow.destroy();
}

/**
 * Creates the tray
 */
const createTray = () => {
  tray = new Tray(path.join(__dirname, "assets/icons/robot-head-tray.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: "Quit",
      click: async function () {
        await beforeQuit()
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Olas Operate");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow.show();
  });
};

/**
 * Creates the splash window
 */
const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 200,
    resizable: false,
    show: true,
    title: "Olas Operate",
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  splashWindow.loadURL("file://" + __dirname + "/loading/index.html");
  if (isDev) {
    splashWindow.webContents.openDevTools()
  }
};

/**
 * Creates the main window
 */
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: appConfig.width,
    height: appConfig.height,
    resizable: false,
    title: "Olas Operate",
  });

  // Ensure that external links are opened in native browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.setMenuBarVisibility(false);
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${appConfig.ports.dev.next}`);
  } else {
    mainWindow.loadURL(`http://localhost:${appConfig.ports.prod.next}`);
  }
  mainWindow.webContents.on("did-fail-load", () => {
    mainWindow.webContents.reloadIgnoringCache();
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
};

async function launchDaemon() {
  const check = new Promise(function (resolve, reject) {
    operateDaemon = spawn(OperateCmd, ["daemon", "--port=8000", `--home=${OperateDirectory}`])
    operateDaemonPid = operateDaemon.pid;
    operateDaemon.stderr.on("data", (data) => {
      if (data.toString().includes("Uvicorn running on")) {
        resolve({ running: true, error: null })
      }
      if (data.toString().includes("error while attempting to bind on address")) {
        resolve({ running: false, error: "Port already in use" })
      }
    });
  })
  return await check
}

async function launchDaemonDev() {
  const check = new Promise(function (resolve, reject) {
    operateDaemon = spawn("poetry", ["run", "operate", "daemon", "--port=8000", "--home=.operate"])
    operateDaemonPid = operateDaemon.pid;
    operateDaemon.stderr.on("data", (data) => {
      if (data.toString().includes("Uvicorn running on")) {
        resolve({ running: true, error: null })
      }
      if (data.toString().includes("error while attempting to bind on address")) {
        resolve({ running: false, error: "Port already in use" })
      }
      console.log(data.toString().trim());
    });
    operateDaemon.stdout.on("data", (data) => {
      console.log(data.toString().trim());
    })
  })
  return await check
}

async function launchNextApp() {
  const nextApp = next({
    dev: false,
    dir: path.join(__dirname),
    port: appConfig.ports.prod.next,
  });
  await nextApp.prepare()

  const handle = nextApp.getRequestHandler();
  const server = http.createServer((req, res) => {
    handle(req, res); // Handle requests using the Next.js request handler
  });
  server.listen(appConfig.ports.prod.next, (err) => {
    if (err) throw err;
    console.log(`> Next server runinng on http://localhost:${appConfig.ports.prod.next}`);
  });
}

async function launchNextAppDev() {
  await new Promise(function (resolve, reject) {
    nextAppProcess = spawn("yarn", ["dev:frontend"])
    nextAppProcessPid = nextAppProcess.pid;
    nextAppProcess.stdout.on("data", (data) => {
      console.log(data.toString().trim());
      setTimeout(function () { resolve(true) }, 1000)
    });
  })
}


ipcMain.on('check', async function (event, argument) {
  try {
    event.sender.send("response", "Checking installation")
    if (!isDev && !isInstalled()) {
      event.sender.send("response", "Installing Operate Daemon")
      if (platform === "darwin") {
        await setupDarwin();
      } else if (platform === "win32") {
        // TODO
      } else {
        await setupUbuntu();
      }
    }

    if (isDev) {
      event.sender.send("response", "Starting Operate Daemon In Development Mode")
      await launchDaemonDev()
      event.sender.send("response", "Starting Frontend Server In Development Mode")
      await launchNextAppDev()
    } else {
      event.sender.send("response", "Starting Operate Daemon")
      await launchDaemon()
      event.sender.send("response", "Starting Frontend Server")
      await launchNextApp()
    }

    event.sender.send("response", "Launching App")
    splashWindow.destroy();
    createMainWindow();
    createTray()
  } catch (e) {
    console.log(e)
    new Notification({
      title: "Error",
      body: e,
    }).show();
    event.sender.send("response", e)
    // app.quit();
  }
});

// APP-SPECIFIC EVENTS
app.on("ready", async () => {
  createSplashWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  beforeQuit()
});
