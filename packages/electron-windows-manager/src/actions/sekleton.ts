import { BrowserView } from "electron";
/**
 * 设置骨架屏
 * @param {number} id
 * @param {windowsManager.userConfig} options
 */
export function setSekleton(
  window: Electron.BrowserWindow,
  Sekleton?: string,
  resourceDir?: string
): Electron.BrowserView {
  let browserView = new BrowserView();
  window.setBrowserView(browserView);
  browserView.setBounds({ x: 0, y: 0, width: 800, height: 600 });
  browserView.setAutoResize({
    width: true,
    height: true,
    horizontal: true,
    vertical: true,
  });
  let fileUrl = "";
  if (Sekleton) {
    fileUrl = `${resourceDir}/${Sekleton}`;
  } else {
    fileUrl = `${resourceDir}/loading.html`;
  }
  browserView.webContents.loadFile(fileUrl);
  return browserView;
}

/**
 * 关闭骨架屏信息
 */
export function closeSekleton(
  window: Electron.BrowserWindow | null,
  windowInfo: windowsManager.windowList | undefined
) {
  if (windowInfo) {
    if (!windowInfo.view) {
      console.log("该窗口没有骨架屏");
      return false;
    } else {
      if (window) {
        console.log("stop");
        window.removeBrowserView(windowInfo.view);
        return true;
      } else {
        console.log("没有window");
        return false;
      }
    }
  } else {
    console.log("该窗口不在管理内");
    return false;
  }
}
