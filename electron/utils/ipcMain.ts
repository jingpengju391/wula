import { app, dialog, FileFilter, ipcMain } from "electron";
import { initLocalWs, killLocalWs } from ".";
import { win } from "../main";
import { getApiAddress, getWsAddress, getWsPort, setApiAddress, setWsAddress, setWsPort } from "../store";
import { setTrayTitle } from "./tray";
import { screenshot } from "./srcShot";
import { cachePath } from "./cache";

ipcMain.on("GetIMConfig", (e) => {
  const config = {
    IMApiAddress: getApiAddress(),
    IMWsAddress: getWsAddress(),
    IMWsPort: getWsPort(),
  };
  e.returnValue = config;
});

ipcMain.on("SetIMConfig", (e, config) => {
  setApiAddress(config.IMApiAddress);
  setWsAddress(config.IMWsAddress);
  setWsPort(config.IMWsPort);
  killLocalWs();
  initLocalWs();
});

ipcMain.on("FocusHomePage", (e) => {
  win?.show();
});

ipcMain.on("UnReadChange", (e, num) => {
  app.setBadgeCount(num);
  setTrayTitle(num);
});

ipcMain.on("MiniSizeApp", (e) => {
  if (win?.isMinimized()) {
    win.restore();
  } else {
    win?.minimize();
  }
});

ipcMain.on("MaxSizeApp", (e) => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on("CloseApp", (e) => {
  app.quit();
});

ipcMain.on("Screenshot", (e) => {
  e.returnValue = screenshot();
});

ipcMain.on("GetCachePath", (e) => {
  e.returnValue = cachePath;
});

ipcMain.on("OpenShowDialog", (e,filters:FileFilter[]) => {
  e.returnValue = dialog.showOpenDialogSync(win!, {
    filters,
    properties: ["openFile"],
  });
});

ipcMain.on("Download",(e,url) => {
  win?.webContents.downloadURL(url);
})
