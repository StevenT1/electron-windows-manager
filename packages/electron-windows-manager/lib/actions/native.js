"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createWindow = createWindow;
exports.setMainWindow = setMainWindow;
exports.getMainWindow = getMainWindow;
exports.setQuitMode = setQuitMode;
exports.getWillQuitApp = getWillQuitApp;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _electron() {
  const data = _interopRequireWildcard(require("electron"));

  _electron = function _electron() {
    return data;
  };

  return data;
}

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let mainWindow = null;

const isReady = _electron().app.whenReady();

let willQuitApp = true;
/**
 * 创建窗口
 */

function createWindow(_x) {
  return _createWindow.apply(this, arguments);
}
/**
 * 设置为主窗口
 */


function _createWindow() {
  _createWindow = _asyncToGenerator(function* (options, webPreferences = {}) {
    options = options || {};
    yield isReady;
    let window = new (_electron().default.BrowserWindow)(Object.assign({
      show: false,
      autoHideMenuBar: true,
      webPreferences: _objectSpread(_objectSpread({
        enableRemoteModule: true,
        nodeIntegration: false,
        webSecurity: false,
        webviewTag: true,
        contextIsolation: false
      }, webPreferences), {}, {
        preload: options.bridgeName
      })
    }, options));

    if (!options.show) {
      if (window) window.once("ready-to-show", () => {
        // showByClient: 由用户决定是否展示
        !options.showByClient && window.show();
      });
    }

    if (options.maximize) {
      window.maximize();
    }

    window.on("closed", () => {
      window = null;
    });
    return window.id;
  });
  return _createWindow.apply(this, arguments);
}

function setMainWindow(id) {
  mainWindow = _electron().default.BrowserWindow.fromId(id);
}
/**
 * 获得主窗口
 */


function getMainWindow() {
  var _mainWindow;

  return (_mainWindow = mainWindow) === null || _mainWindow === void 0 ? void 0 : _mainWindow.id;
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