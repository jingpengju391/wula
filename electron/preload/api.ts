import { ipcRenderer, contextBridge, FileFilter, shell } from "electron";
import { networkInterfaces } from "os";
import { platform } from "process";
import type { API, APIKey } from "../../src/@types/api";
import { getAppCloseAction, getWsPort, setAppCloseAction } from "../store";
import * as fs from "fs";

export const apiKey: APIKey = "electron";

const isMac = platform === "darwin";

const isWin = platform === "win32";

let listeners: any = {};

const getPlatform = () => {
  switch (platform) {
    case "darwin":
      return 4;
    case "win32":
      return 3;
    case "linux":
      return 7;
    default:
      return 5;
  }
};

const getLocalWsAddress = () => {
  let ips = [];
  const intf = networkInterfaces();
  for (let devName in intf) {
    let iface = intf[devName];
    console.log(iface);

    for (let i = 0; i < iface!.length; i++) {
      let alias = iface![i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
        ips.push(alias.address);
      }
    }
  }
  return `ws://${ips[0]}:${getWsPort()}`;
  // return `ws://172.16.9.247:30000`;
};

const getIMConfig = () => {
  return ipcRenderer.sendSync("GetIMConfig");
};

const setIMConfig = (config: any) => {
  ipcRenderer.send("SetIMConfig", config);
};

const focusHomePage = () => {
  ipcRenderer.send("FocusHomePage");
};

const unReadChange = (num: number) => {
  ipcRenderer.send("UnReadChange", num);
};

const miniSizeApp = () => {
  ipcRenderer.send("MiniSizeApp");
};

const maxSizeApp = () => {
  ipcRenderer.send("MaxSizeApp");
};

const closeApp = () => {
  ipcRenderer.send("CloseApp");
};

const addIpcRendererListener = (event: string, listener: (...args: any[]) => void, flag: string) => {
  listeners[flag] = { event, listener };
  ipcRenderer.addListener(event, listener);
};

const removeIpcRendererListener = (flag: string) => {
  ipcRenderer.removeListener(listeners[flag].event, listeners[flag].listener);
  delete listeners[flag];
};

const screenshot = () => {
  ipcRenderer.send("Screenshot");
};

const getCachePath = () => {
  return ipcRenderer.sendSync("GetCachePath");
};

const OpenShowDialog = (filters: FileFilter[]) => {
  console.log(filters);
  
  return ipcRenderer.sendSync("OpenShowDialog", filters);
};

const file2url = (path: string) => {
  const file = fs.readFileSync(path);
  const bolb = new Blob([file]);
  return URL.createObjectURL(bolb);
};

const save2path = (path: string, base64: string) => {
  return new Promise((resolve, reject) => {
    let rbase64 = base64.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFile(path, Buffer.from(rbase64, "base64"), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve("success");
      }
    });
  });
};

const fileExists = (path: string) => {
  return fs.existsSync(path);
};

const openFile = (path: string) => {
  shell.openPath(path);
};

const showInFinder = (path: string) => {
  shell.showItemInFolder(path);
};

const download = (path: string) => {
  ipcRenderer.send("Download",path)
}

export const api: API = {
  platform: getPlatform(),
  isMac,
  isWin,
  getLocalWsAddress,
  getIMConfig,
  setIMConfig,
  focusHomePage,
  unReadChange,
  miniSizeApp,
  maxSizeApp,
  closeApp,
  getAppCloseAction,
  setAppCloseAction,
  addIpcRendererListener,
  removeIpcRendererListener,
  screenshot,
  getCachePath,
  OpenShowDialog,
  file2url,
  save2path,
  fileExists,
  openFile,
  showInFinder,
  download
};

contextBridge.exposeInMainWorld(apiKey, api);
