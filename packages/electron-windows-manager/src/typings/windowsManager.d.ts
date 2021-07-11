///<reference types="electron" />
declare namespace windowsManager {
  interface windowList {
    name: string | undefined,
    isOpen: boolean,
    component: string | undefined,
    // 传消息
    // sendMsg: {},
    // backMsg: {},
    isMain: boolean,
    winId: number,
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
    urlInfo?: Array<string>,
    showFirst?: boolean;
    component?: string;
    skeleton?: string,
    hostname?: string
  }
  interface native { [k: string]: any }

  interface config {
    totalIdleWindowsNum: number;
    urlInfo: never[];
    showFirst: boolean;
    native: native,
    resourceDir: string,
    hostName: string,
  }
}
// declare var global: NodeJS.Global & typeof globalThis & { [k: string]: any };
