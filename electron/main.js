const { app, BrowserWindow, Tray, Menu, shell } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const { isPortAvailable, portRange, findAvailablePort } = require("./ports");

let tray, mainWindow, splashWindow;
let flaskProcess, nextProcess, hardhatProcess;
let processList = [];

const DEFAULT_PORTS = {
  flask: 5000,
  next: 3000,
  hardhat: 8545,
};

const killAllProcesses = () =>
  processList.forEach((p) => {
    console.log("Killing process: ", p.pid);
    p.kill();
  });

const launchProcesses = async () => {
  let flaskPort = DEFAULT_PORTS.flask,
    nextPort = DEFAULT_PORTS.next,
    hardhatPort = DEFAULT_PORTS.hardhat;

  // flask
  try {
    const flaskPortAvailable = await isPortAvailable(flaskPort);
    if (!flaskPortAvailable) {
      flaskPort = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Flask port: ", error);
    app.quit();
  }

  flaskProcess = exec(`yarn dev:backend`);
  processList.push(flaskProcess);
  flaskProcess.stdout.on("data", (data) =>
    console.log("[BACKEND]: ", data.toString()),
  );
  flaskProcess.stderr.on("data", (data) =>
    console.error("[BACKEND]: ", data.toString()),
  );

  // next
  try {
    const nextPortAvailable = await isPortAvailable(DEFAULT_PORTS.next);
    if (!nextPortAvailable) {
      nextPort = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Next port: ", error);
    app.quit();
  }

  nextProcess = exec(
    `cross-env NEXT_PUBLIC_FLASK_PORT=${flaskPort} yarn dev:frontend --port=${nextPort}`,
  );
  processList.push(nextProcess);
  nextProcess.stdout.on("data", (data) =>
    console.log("[FRONTEND]: ", data.toString()),
  );
  nextProcess.stderr.on("data", (data) =>
    console.error("[FRONTEND]: ", data.toString()),
  );

  // hardhat
  try {
    const hardhatPortAvailable = await isPortAvailable(DEFAULT_PORTS.hardhat);
    if (!hardhatPortAvailable) {
      hardhatPort = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Hardhat port: ", error);
    app.quit();
  }

  hardhatProcess = exec(
    `npx hardhat node --port ${hardhatPort} --fork https://lb.nodies.app/v1/406d8dcc043f4cb3959ed7d6673d311a`,
  );
  processList.push(hardhatProcess);
  hardhatProcess.stdout.on("data", (data) =>
    console.log("[HARDHAT]: ", data.toString()),
  );
  hardhatProcess.stderr.on("data", (data) =>
    console.error("[HARDHAT]: ", data.toString()),
  );

  return {
    flaskProcess,
    nextProcess,
    hardhatProcess,
    flaskPort,
    nextPort,
    hardhatPort,
  };
};

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 856,
    height: 1321,
    frame: false,
    alwaysOnTop: false,
  });

  splashWindow.loadURL("file://" + __dirname + "/loading.html");
};

const createMainWindow = (nextPort) => {
  mainWindow = new BrowserWindow({
    width: 856,
    height: 1321,
    show: false,
    title: "Olas Operate",
    resizable: false,
  });

  // Ensure that external links are opened in native browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://localhost:${nextPort}`);

  mainWindow.webContents.openDevTools();

  // mainWindow.webContents.on("did-fail-load", () => {
  //   mainWindow.webContents.reloadIgnoringCache();
  // });

  mainWindow.on("ready-to-show", () => {
    splashWindow.destroy();
    mainWindow.show();
  });

  mainWindow.on("minimize", function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
};

// Main process events

process.on("SIGINT", () => {
  console.log(
    "Main process received SIGINT signal. Killing all child processes...",
  );
  killAllProcesses();
  app.quit();
  process.exit();
});

// App events

app.on("ready", async () => {
  createSplashWindow();
  const { nextPort } = await launchProcesses();
  createMainWindow(nextPort);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  app.isQuiting = true;
  killAllProcesses();
});

app.whenReady().then(() => {
  tray = new Tray(path.join(__dirname, "icons/robot-head.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: "Quit",
      click: function () {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Olas Operate");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => {
    mainWindow.show();
  });
});
