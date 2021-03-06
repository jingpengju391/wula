export type APIKey = "electron";
export type API = {
  platform: number;
  isMac: boolean;
  isWin: boolean;
  getLocalWsAddress: () => string;
  getIMConfig: () => any;
  setIMConfig: (config: any) => void;
  focusHomePage: () => void;
  unReadChange: (num: number) => void;
  miniSizeApp: () => void;
  maxSizeApp: () => void;
  closeApp: () => void;
  getAppCloseAction: () => boolean;
  setAppCloseAction: (close: boolean) => void;
  addIpcRendererListener: (event: string, listener: (...args: any[]) => void, flag: string) => void;
  removeIpcRendererListener: (flag: string) => void;
  screenshot: () => void;
  getCachePath: () => string;
  OpenShowDialog: (filters:any[]) => string[] | undefined;
  file2url: (path: string) => string;
  save2path: (path: string,base64:string) => Promise<unknown>;
  fileExists: (path: string) => boolean;
  openFile: (path: string) => void;
  showInFinder: (path: string) => void;
  download: (path: string) => void;
};
