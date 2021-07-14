///<reference types="electron" />
declare namespace windowsManager {
  interface windowList {
    name: string,
    isOpen: boolean,
    component: string | undefined,
    // 传消息
    // sendMsg: {},
    // backMsg: {},
    isMain: boolean,
    winId: number,
    view?: Electron.BrowserView
  }
  interface baseWindowConfig {
    show: boolean,
    transparent: boolean,
    frame: boolean,
    showByClient: boolean,
    isBoolWindow: boolean,
    showFirst: boolean
  }
  interface userConfig extends Electron.BrowserWindowConstructorOptions {
    name: string;
    totalIdleWindowsNum?: number;
    urlInfo?: Array<string>;
    showFirst?: boolean;
    component?: string;
    Sekleton?: string;
    isOpenSekleton?: boolean;
    path?: string
  }
  interface native { [k: string]: any }

  interface config {
    totalIdleWindowsNum: number;
    urlInfo: Array<string>;
    baseWindowConfig: baseWindowConfig;
    native: native,
    resourceDir: string,
    path: string,
  }
}
// declare var global: NodeJS.Global & typeof globalThis & { [k: string]: any };
