import { app, clipboard } from "electron";
import * as isDev from "electron-is-dev";
import { exec, execFile } from "child_process";
import { win } from "../main";

const appPath = app.getAppPath();
const clipboardParsing = () => {
  let pngs = clipboard.readImage().toPNG(); //可改变图片格式，如：toJPEG
  //@ts-ignore
  let imgData = Buffer.from(pngs, "base64");
  let imgs = "data:image/png;base64," + btoa(new Uint8Array(imgData).reduce((data, byte) => data + String.fromCharCode(byte), ""));
  win?.webContents.send("ScreenshotData",imgs)
};

export const screenshot = () => {

  if (process.platform == "darwin") {
    exec(`screencapture -i -c`, (error, stdout, stderr) => {
      if (!error) {
        clipboardParsing();
      }
    });
  } else if(process.platform === "win32") {
    const exPath = isDev ? `${__dirname}/../../../electron/exec/PrintScr.exe` : `${appPath}/../exec/PrintScr.exe`;
    let screen_window = execFile(exPath);
    screen_window.on("exit", (code) => {
      if (code) {
        clipboardParsing();
      }
    });
  } else if(process.platform === "linux") {
    const exPath = isDev ? `${__dirname}/../../../electron/exec/PrintScr_arm` : `${appPath}/../exec/PrintScr_arm`;
    execFile(exPath);
  }
};
