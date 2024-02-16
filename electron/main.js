const { app, BrowserWindow, Tray, Menu, shell } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const { isPortAvailable, portRange, findAvailablePort } = require("./ports")

let tray, mainWindow, splashWindow;
let processList = [];


let processes = {
  backend: {port: 8000, ready: false},
  frontend: {port: 3000, ready: false},
  hardhat: {port: 8545, ready: false}, //temporary
};

const killAllProcesses = () =>
  processList.forEach((p) => {
    console.log("Killing process: ", p.pid);
    p.kill();
  });

const checkServersReadyThenMain = () => {
  const allReady = Object.values(processes).every((p) => p.ready);
  if (allReady) {
    createMainWindow();
  }
};

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

  const backendProcess = exec(`yarn dev:backend`);
  processList.push(backendProcess);
  backendProcess.stdout?.on("data", (data) => {
    // if(data.toString().includes("Uvicorn running on")) {
    //   processes.backend.ready = true;
    //   checkServersReadyThenMain()
    // };
    console.log("[BACKEND]: ", data.toString())
  });
  backendProcess.stderr?.on("data", (data) =>
    console.error("[BACKEND]: ", data.toString()),
  );

  // frontend
  try {
    const frontendPortAvailable = await isPortAvailable(processes.frontend.port);
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

  const frontendProcess = exec(
    `cross-env NEXT_PUBLIC_BACKEND_PORT=${processes.backend.port} yarn dev:frontend --port=${processes.frontend.port}`,
  );
  processList.push(frontendProcess);
  frontendProcess.stdout?.on("data", (data) => {
    // if (data.toString().includes("Ready in")) {
    //   processes.frontend.ready = true;
    //   checkServersReadyThenMain()
    // };
    console.log("[FRONTEND]: ", data.toString())
  }
  );
  frontendProcess.stderr?.on("data", (data) =>
    console.error("[FRONTEND]: ", data.toString()),
  );

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

  const hardhatProcess = exec(
    `yarn dev:hardhat --port ${processes.hardhat.port}`,
  );
  processList.push(hardhatProcess);
  hardhatProcess.stdout?.on("data", (data) => {
    // if (data.toString().includes("Started HTTP and WebSocket JSON-RPC server at")) {
    //   processes.hardhat.ready = true;
    //   checkServersReadyThenMain();
    // }
    console.log("[HARDHAT]: ", data.toString())
  });
  hardhatProcess.stderr?.on("data", (data) =>
    console.error("[HARDHAT]: ", data.toString()),
  );
};

const createSplashWindow = () => {
  splashWindow = new BrowserWindow({
    width: 856,
    height: 1321,
    resizable: false,
    show: false,
    title: "Olas Operate",    
  });
  splashWindow.loadURL("file://" + __dirname + "/loading.html").then();
};

const createMainWindow = () => {
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
  await launchProcesses();
  createMainWindow();
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
  app.isQuitting = true;
  killAllProcesses();
});

app.whenReady().then(() => {
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
});
