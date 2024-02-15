const { app, BrowserWindow, Tray, Menu, shell } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const { isPortAvailable, portRange, findAvailablePort } = require("./ports");

let tray, mainWindow, splashWindow;
let backendProcess, frontendProcess, hardhatProcess;
let processList = [];

const DEFAULT_PORTS = {
  backend: 8000,
  frontend: 3000,
  hardhat: 8545,
};

const killAllProcesses = () =>
  processList.forEach((p) => {
    console.log("Killing process: ", p.pid);
    p.kill();
  });

const launchProcesses = async () => {
  let backendPort = DEFAULT_PORTS.backend,
    frontendPort = DEFAULT_PORTS.frontend,
    hardhatPort = DEFAULT_PORTS.hardhat;

  // backend
  try {
    const backendPortAvailable = await isPortAvailable(backendPort);
    if (!backendPortAvailable) {
      backendPort = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Backend port: ", error);
    app.quit();
  }

  backendProcess = exec(`yarn dev:backend`);
  processList.push(backendProcess);
  backendProcess.stdout.on("data", (data) =>
    console.log("[BACKEND]: ", data.toString()),
  );
  backendProcess.stderr.on("data", (data) =>
    console.error("[BACKEND]: ", data.toString()),
  );

  // frontend
  try {
    const frontendPortAvailable = await isPortAvailable(DEFAULT_PORTS.frontend);
    if (!frontendPortAvailable) {
      frontendPort = await findAvailablePort(
        portRange.startPort,
        portRange.endPort,
      );
    }
  } catch (error) {
    console.error("Error checking Next port: ", error);
    app.quit();
  }

  frontendProcess = exec(
    `cross-env NEXT_PUBLIC_BACKEND_PORT=${backendPort} yarn dev:frontend --port=${frontendPort}`,
  );
  processList.push(frontendProcess);
  frontendProcess.stdout.on("data", (data) =>
    console.log("[FRONTEND]: ", data.toString()),
  );
  frontendProcess.stderr.on("data", (data) =>
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
    `yarn dev:hardhat --port ${hardhatPort}`,
  );
  processList.push(hardhatProcess);
  hardhatProcess.stdout.on("data", (data) =>
    console.log("[HARDHAT]: ", data.toString()),
  );
  hardhatProcess.stderr.on("data", (data) =>
    console.error("[HARDHAT]: ", data.toString()),
  );

  return {
    backendProcess,
    frontendProcess,
    hardhatProcess,
    backendPort,
    frontendPort,
    hardhatPort,
  };
};

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 856,
    height: 1321,
    resizable: false,
    show: false,
    title: "Olas Operate",    
  });
  splashWindow.loadURL("file://" + __dirname + "/loading.html").then(()=>splashWindow.show());
};

const createMainWindow = (frontendPort) => {
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
  mainWindow.loadURL(`http://localhost:${frontendPort}`);

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
  const { frontendPort } = await launchProcesses();
  createMainWindow(frontendPort);
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
