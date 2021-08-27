import electron, { app } from 'electron';
let mainWindow: number;
const isReady = app.whenReady();
let willQuitApp = true;
/**
 * 创建窗口
 */
async function createWindow(
  options: windowsManager.baseWindowConfig,
  webPreferences = {}
) {
  options = options || {};
  await isReady;
  
  let window: Electron.BrowserWindow | null = new electron.BrowserWindow(
    Object.assign(
      {
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
          enableRemoteModule: true,
          nodeIntegration: false,
          webSecurity: false,
          webviewTag: true,
          contextIsolation: false,
          ...webPreferences,
          preload: options.bridgeName,
        },
      },
      options
    )
  );
  
  if (!options.show) {
    if (window)
      window.once("ready-to-show", () => {
        // showByClient: 由用户决定是否展示
        !options.showByClient && window!.show();
      });
  }

  if (options.maximize) {
    window.maximize();
  }

  window.on("closed", () => {
    window = null;
  });

  return window.id;
}
/**
 * 设置为主窗口
 */
function setMainWindow(id: number) {
  mainWindow = id
}
/**
 * 获得主窗口
 */
function getMainWindow() {
  return mainWindow;
}
/**
 * 设置主窗口关闭是否退出
 */
function setQuitMode(quit = true) {
  willQuitApp = quit;
  return true;
}
/**
 * 获得是否退出的状态
 */
function getWillQuitApp() {
  return willQuitApp;
}
export {
  createWindow,
  setMainWindow,
  getMainWindow,
  setQuitMode,
  getWillQuitApp,
};
