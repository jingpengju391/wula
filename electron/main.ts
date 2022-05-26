import { app, BrowserWindow, Menu, session } from "electron";
import * as path from "path";
import * as isDev from "electron-is-dev";
import { initLocalWs, killLocalWs, setTray } from "./utils";
import "./utils/ipcMain";
import { setAppStatus } from "./store";

export let win: BrowserWindow | null = null;

async function createWindow() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 980,
    height: 735,
    minWidth: 500,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./preload/api.js"),
    },
    frame: false,
    // resizable:false,
    titleBarStyle: "hidden",
  });

  setTray(win);

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    const electronPath = path.join(__dirname, "..", "..", "node_modules", "electron", "dist", "electron");
    try {
      require("electron-reload")(__dirname, {
        electron: electronPath,
        forceHardReset: true,
        hardResetMethod: "exit",
      });
    } catch (_) {}
  }

  //  Download
  session.defaultSession.on("will-download", (event, item, webContents) => {
    const msgid = item.getURL().split("?msgid=")[1];
    const rootPath = app.getPath("userData") + "/openim_file";
    const filePath = path.join(rootPath, item.getFilename());
    item.setSavePath(filePath);
    item.on("done", (ev, state) => {
      webContents.send("DownloadFinish", state,msgid,item.getSavePath());
    });
    item.on("updated", (ev, state) => {
      let process = item.getReceivedBytes() / item.getTotalBytes();
      process = Math.round(process * 100);
      webContents.send("DownloadUpdated", state, process, msgid);
    });
  });

  // DevTools
  if (isDev) {
    win.webContents.openDevTools({
      mode: "detach",
    });
  }

  // localWs
  await initLocalWs();
  setAppStatus(true);
}
// ipcMain.on('login-resize',()=>{
//   win!.setSize(1050, 700)
// })

app.setAppUserModelId("乌拉");

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  } else {
    win.show();
  }
});

app.on("quit", () => {
  setAppStatus(false);
  killLocalWs();
});
