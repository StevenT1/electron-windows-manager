"use strict";

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const _require = require('electron'),
      app = _require.app,
      BrowserWindow = _require.BrowserWindow,
      webContents = _require.webContents;

const _require2 = require('lodash'),
      lodash = _require2.default;

const _require3 = require('../native'),
      createWindow = _require3.createWindow; // const TWEEN = require('@tweenjs/tween.js')

/*
 * 简单说一下这个窗口的实现思路
 * 实现窗口容器思考了两种方式，第一种方式是通过在主进程中设置一个容器来存放对应的窗口，子进程通过electron自带的通讯方式和主进程容器进行通讯创建窗口
 */


var _windowsList = /*#__PURE__*/_classPrivateFieldLooseKey("windowsList");

class WindowsBox {
  constructor(config) {
    Object.defineProperty(this, _windowsList, {
      writable: true,
      value: void 0
    });
    config = config || {};
    this.TotalFreeWindowsNum = config.TotalFreeWindowsNum || 2; // 允许空闲的窗口数量

    this.port = config.port || 9080;
    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList] = new Map(); // 窗口容器

    this.baseWindowConfig = {
      webPreferences: {
        nodeIntegration: true
      },
      show: false,
      transparent: false,
      frame: false
    }; // 单例模式

    if (WindowsBox.prototype.__Instance === undefined) {
      WindowsBox.prototype.__Instance = this;
      this.checkFreeWindow();
    }

    return WindowsBox.prototype.__Instance;
  }
  /*
   * 打开新的空白窗口等待加载
   */


  creatFreeWindow(option) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let win = yield createWindow(option); // 设置传参

      _classPrivateFieldLooseBase(_this, _windowsList)[_windowsList].set(win.id, {
        name: '',
        isUse: false,
        url: option.url,
        sendMsg: {},
        backMsg: {},
        fromId: '',
        reuse: false,
        winId: win.id,
        window: win.window
      });

      win.window.on('close', () => {
        _classPrivateFieldLooseBase(_this, _windowsList)[_windowsList].get(win.id).hide();
      }); // win.loadURL(modalPath)
      // return win
    })();
  }
  /*
   * 打开隐藏窗口
   * options可以对显示的窗口进行配置，如显示的位置信息
   * options={url:'',}
   */


  openTargetWindow(option) {
    const windowInfo = this.getWindowInfoByUrl(option.url);

    if (windowInfo) {
      // option.hasOwnProperty('x') && windowInfo.window.setBounds({ x: option.x, y: option.y })
      // 窗口基础状态
      windowInfo.window.show(); // lru移动

      let targeInfo = _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(windowInfo.winId);

      _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].delete(windowInfo.winId);

      _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].set(windowInfo.winId, targeInfo); // 更新队列


      this.refreshFreeWindowInfo(windowInfo.winId, _objectSpread({
        isUse: true
      }, option));
    } else {
      this.useFreeWindow(option);
      this.openTargetWindow(option);
    }
  }
  /*
   * 关闭窗口
   */


  closeFreeWindow(winId) {
    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(winId).window.close();
  }
  /*
   * 平衡空白窗口数量
   */


  checkFreeWindow() {
    // 如果有缓存，查找空余窗口是否足够，不足的话创建到给定水平（同时删掉可能多出来的窗口）
    let notUseWindowsNum = 0;

    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].forEach((value, key) => {
      if (!value.isUse) notUseWindowsNum++;
    });

    let freeWindowsNum = this.TotalFreeWindowsNum - notUseWindowsNum;

    if (freeWindowsNum > 0) {
      for (var i = freeWindowsNum; i > 0; i--) {
        this.creatFreeWindow({
          show: false,
          transparent: false,
          frame: true,
          isBoolWindow: true
        });
      }
    }
  }
  /*
   * 使用一个空白窗口
   * 暂时支持初始几个参数
   * {width,height,model,router}
   */


  useFreeWindow(option) {
    // 判断参数是否有name和refresh属性（如果有url属性查找该url窗口是否存在，存在显示不存在新建）
    let freeWindow, freeWindowInfo;

    if (option.url) {
      // 查询是否有该url窗口存在
      let winInfo = this.getWindowInfoByUrl(option.url); //  存在url窗口

      if (winInfo) {
        // 切换url
        this.windowUrlChange(winInfo.win, option.url); // 更新队列

        this.refreshFreeWindowInfo(winInfo.winId, _objectSpread({
          isUse: true
        }, option));
      } else {
        //  不存在url窗口
        freeWindowInfo = this.getNewWindow(option);
        freeWindow = freeWindowInfo.window; // 路由跳转 覆盖原本的url内容

        this.windowUrlChange(freeWindow, option.url); // 是否reload，如果多个tab拖入新窗口，从别的tab拖动打开是否需要reload
        // freeWindow.reload();
        // 更新队列

        this.refreshFreeWindowInfo(freeWindowInfo.winId, _objectSpread({
          isUse: true
        }, option)); // this.checkFreeWindow()
      }
    } else {
      // 拉出窗口
      freeWindowInfo = this.getNewWindow();
      freeWindow = freeWindowInfo.window; // 路由跳转

      this.windowUrlChange(freeWindow, ''); // 更新队列

      this.refreshFreeWindowInfo(freeWindowInfo.winId, _objectSpread({
        isUse: true
      }, option));
      this.checkFreeWindow();
    }

    return freeWindow;
  }
  /*
   * @desc 更新队列
   */


  refreshFreeWindowInfo(winId, option) {
    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].set(winId, Object.assign(_classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(winId), option));
  }
  /*
   * @desc 新窗口路由跳转option
   * @parame option {object} {win: win, name: '', data: {}, router: ''}
   */


  windowUrlChange(win, winUrl) {
    win.loadURL(winUrl); // if (win.webContents.isLoading()) {
    //   win.webContents.once('did-finish-load', function () {
    //     win.webContents.send('_changeModelPath', router)
    //   })
    // } else {
    //   win.webContents.send('_changeModelPath', router)
    // }
  }
  /*
   * @desc 重新设置窗口的基础属性
   * 目前需要手动调整的后期根据需求加入
   * @param {object} config:{vibrancy, width, height, minimizable, maximizable, resizable, x, y, center, alwaysOnTop, skipTaskbar}
   */


  setWindowConfig(config, freeWindow) {
    // 检查窗口是否允许最大化最小化（maximizable，minimizable）
    if (config.minimizable === false) {
      freeWindow.setMinimizable(false);
    }

    if (config.maximizable === false) {
      freeWindow.setMaximizable(false);
    }

    if (config.resizable === false) {
      freeWindow.setResizable(false);
    } // 重置当前位置


    if (config.x && config.y) {
      freeWindow.setPosition(config.x, config.y);
    }

    if (config.center) {
      freeWindow.center();
    } // 是否置顶窗口


    if (config.alwaysOnTop) {
      freeWindow.setAlwaysOnTop(true);
    } // 是否在任务栏中显示


    if (config.skipTaskbar) {
      freeWindow.setSkipTaskbar(true);
    }
  }
  /*
   * 取出一个空白窗口并且返回（仅仅取出对象）
   */


  getNewWindow(option) {
    // 是否父子窗口
    // if (option.parent) {
    //   let win = this.creatFreeWindow(option)
    //   return this.getWindowInfoById(win.id)
    // } else {
    let willReturnWinId,
        isBreak = false;

    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].forEach((value, key) => {
      if (value.isUse === false) {
        willReturnWinId = key;
        isBreak = true;
      }

      if (isBreak) {
        return;
      }
    });

    console.log(willReturnWinId); // 超过限额，寻找到最后使用的窗口进行替换

    if (!willReturnWinId) {
      // 找到第一个最近未使用的窗口
      const willReplaceWindowId = _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].keys().next().value;

      const windowInfo = _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(willReplaceWindowId);

      _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].set(windowInfo.id, Object.assign(_classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(windowInfo.id), {
        isUse: false
      }));

      return windowInfo;
    } else {
      return _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(willReturnWinId);
    } // }

  }

  getWindowInfoById(id) {
    return _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(id);
  }

  getWindowInfoByUrl(url) {
    let windowByUrlId = null;

    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].forEach((value, key) => {
      if (value.url === url) {
        windowByUrlId = key;
      }
    });

    if (windowByUrlId) {
      return _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].get(windowByUrlId);
    } else {
      return false;
    }
  }

  getWinById(id) {
    return BrowserWindow.fromId(id);
  }

  getWinByName(url) {
    let windowInfo = this.getWindowInfoByUrl(url);
    if (!windowInfo) return;
    return windowInfo.window;
  }
  /*
   * 设置窗口的数据
   */


  setWindowInfo(data) {
    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList] = _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].map(row => row.id === data.id ? data : row);
  }
  /*
   * 获取windowList对象
   */


  getWindowList() {
    let res = [];

    _classPrivateFieldLooseBase(this, _windowsList)[_windowsList].forEach((value, key) => {
      res.push([key, value]);
    });

    return res;
  }

}

module.exports = WindowsBox;