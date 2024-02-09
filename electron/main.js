const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let tray, mainWindow, splashWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 856,
    height: 1321,
    show: false,
    title: "Olas Operate",
    resizable: false,
  });

  splashWindow = new BrowserWindow({
    width: 856,
    height: 1321,
    frame: false,
    alwaysOnTop: true,
  });

  splashWindow.loadURL("file://" + __dirname + "/loading.html");

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL("http://localhost:3000");

  // mainWindow.webContents.openDevTools();

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

app.on("ready", () => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
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
        app.isQuiting = true;
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
