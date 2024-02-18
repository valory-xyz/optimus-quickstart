const { app, BrowserWindow, Tray, Menu, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { isPortAvailable, portRange, findAvailablePort } = require("./ports");
const psTree = require("ps-tree");

let tray, mainWindow, splashWindow;
let processList = [];

let processes = {
  backend: { port: 8000, ready: false },
  frontend: { port: 3000, ready: false },
  hardhat: { port: 8545, ready: false }, //temporary
};

// Attempt to acquire the single instance lock
const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) app.quit();

// PROCESS FUNCTIONS

/**
 * Launches the backend, frontend and hardhat processes
 */
const launchProcesses = async () => {
  // backend
  try {
    const backendPortAvailable = await isPortAvailable(processes.backend.port);
    if (!backendPortAvailable) {
      processes.backend.port = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Backend port: ", error);
    app.quit();
  }

  const backendProcess = spawn("yarn", ["dev:backend"], {
    maxBuffer: 1000,
    shell: true,
    detached: false,
  }); // need to assign port
  processList.push(backendProcess);
  // use stderr to capture logs
  backendProcess.stderr.on("data", (data) => {
    if (data.toString().includes("Uvicorn running on")) {
      console.log("Backend ready");
      processes.backend.ready = true;
      checkProcessesReadyThenMain();
    }
    console.log(data.toString());
  });

  // frontend
  try {
    const frontendPortAvailable = await isPortAvailable(
      processes.frontend.port,
    );
    if (!frontendPortAvailable) {
      processes.frontend.port = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Frontend port: ", error);
    app.quit();
  }

  const frontendProcess = spawn(
    "cross-env",
    [
      `NEXT_PUBLIC_BACKEND_PORT=${processes.backend.port}`,
      "yarn",
      "dev:frontend",
      `--port=${processes.frontend.port}`,
    ],
    {
      maxBuffer: 1000,
      shell: true,
      detached: false,
    },
  );
  processList.push(frontendProcess);
  frontendProcess.stdout.on("data", (data) => {
    if (data.toString().includes("Ready in")) {
      console.log("Frontend ready");
      processes.frontend.ready = true;
      checkProcessesReadyThenMain();
    }
  });

  // hardhat
  try {
    const hardhatPortAvailable = await isPortAvailable(processes.hardhat.port);
    if (!hardhatPortAvailable) {
      processes.hardhat.port = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Hardhat port: ", error);
    app.quit();
  }

  const hardhatProcess = spawn(
    "cross-env",
    [`PORT=${processes.hardhat.port}`, `yarn`, `dev:hardhat`],
    {
      maxBuffer: 1000,
      shell: true,
      detached: false,
    },
  );
  processList.push(hardhatProcess);
  hardhatProcess.stdout.on("data", (data) => {
    if (
      data.toString().includes("Started HTTP and WebSocket JSON-RPC server at")
    ) {
      console.log("Hardhat ready");
      processes.hardhat.ready = true;
      checkProcessesReadyThenMain();
    }
  });
};

/**
 * Kills all child processes
 */
const killAllProcesses = () =>
  processList.forEach((p) => {
    try {
      console.log("Killing process: ", p.pid);
      psTree(p.pid, (err, children) => {
        if (err) {
          console.error("Error getting children of process: ", err);
        } else {
          children.forEach((c) => {
            try {
              process.kill(c.PID, "SIGKILL");
            } catch (error) {
              console.error("Error killing child process: ", error);
            }
          });
        }
      });
    } catch (error) {
      console.error("Error killing process: ", error);
    }
  });

/**
 * Checks if all processes are ready and if so, creates the main window and tray
 */
const checkProcessesReadyThenMain = () => {
  const allReady = Object.values(processes).every((p) => p?.ready);
  if (allReady) {
    if (!mainWindow) createMainWindow(); // only create main window once
    if (!tray) createTray(); // only create tray once
  }
};

//  CREATE FUNCTIONS

/**
 * Creates the splash window
 */
const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 1000,
    resizable: false,
    show: true,
    title: "Olas Operate",
    frame: false,
  });
  splashWindow.loadURL("file://" + __dirname + "/loading.html");
};

/**
 * Creates the main window
 */
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 1000,
    show: false,
    title: "Olas Operate",
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Ensure that external links are opened in native browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://localhost:${processes.frontend.port}`);

  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on("did-fail-load", () => {
    mainWindow.webContents.reloadIgnoringCache();
  });

  mainWindow.on("ready-to-show", () => {
    splashWindow.destroy();
    mainWindow.show();
  });

  mainWindow.on("minimize", function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", function (event) {
    event.preventDefault();
    mainWindow.hide();
  });
};

/**
 * Creates the tray
 */
const createTray = () => {
  tray = new Tray(path.join(__dirname, "assets/icons/robot-head.png"));
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
};

// APP-SPECIFIC EVENTS

app.on("ready", async () => {
  createSplashWindow();
  await launchProcesses();
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

let beforeQuitOnceCheck = false;
app.on("before-quit", () => {
  if (beforeQuitOnceCheck) return;
  beforeQuitOnceCheck = true;
  console.log("Main process received before-quit signal.");
  killAllProcesses();
  tray && tray.destroy();
  mainWindow && mainWindow.destroy();
});
