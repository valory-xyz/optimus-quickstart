const { app, BrowserWindow } = require("electron");
// const serve = require("electron-serve");
const path = require("path");

// const appServe = app.isPackaged ? serve({
//   directory: path.join(__dirname, "../out")
// }) : null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.setMenuBarVisibility(false);

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
  
  win.on("minimize", function(event){
    event.preventDefault();
    win.hide();
  });

  win.on("close", function(event){
    if(!app.isQuiting){
      event.preventDefault();
      win.hide();
    }
    return false;
  });
}

app.on("ready", () => {
    createWindow();
    app.on("activate", () => {
        if(BrowserWindow.getAllWindows().length === 0){
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});
