"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setSekleton = setSekleton;
exports.closeSekleton = closeSekleton;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _electron() {
  const data = require("electron");

  _electron = function _electron() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 设置骨架屏
 * @param {number} id
 * @param {windowsManager.userConfig} options
 */
function setSekleton(window, Sekleton, resourceDir) {
  let browserView = new (_electron().BrowserView)();
  window.setBrowserView(browserView);
  browserView.setBounds({
    x: 0,
    y: 0,
    width: 800,
    height: 600
  });
  browserView.setAutoResize({
    width: true,
    height: true,
    horizontal: true,
    vertical: true
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


function closeSekleton(window, windowInfo) {
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