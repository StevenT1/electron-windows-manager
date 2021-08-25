///<reference types="electron" />
declare namespace windowsManager {
  interface windowList {
    name: string,
    isOpen: boolean,
    // 传消息
    // sendMsg: {},
    // backMsg: {},
    isMain: boolean,
    winId: number,
    view?: Electron.BrowserView
  }
  interface baseWindowConfig extends Electron.BrowserWindowConstructorOptions {
    show: boolean,
    transparent: boolean,
    frame: boolean,
    showByClient?: boolean,
    isBoolWindow?: boolean,
    showFirst: boolean,
    bridgeName?:string,
    maximize?:boolean
  }
  interface userConfig  {
    name: string,
    url?:string,
    file?:string,
    totalIdleWindowsNum?: number,
    showFirst?: boolean,
    Sekleton?: string,
    resourceDir?:string,
    isOpenSekleton?: boolean
  }
  interface native { [k: string]: any }

  interface windowManagerConfig {
    totalIdleWindowsNum: number,
    baseWindowConfig: baseWindowConfig,
    resourceDir: string,
    webPreferences?:Electron.WebPreferences
  }
}
// declare var global: NodeJS.Global & typeof globalThis & { [k: string]: any },
declare namespace Electron{}
