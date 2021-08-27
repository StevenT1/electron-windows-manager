"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _sekleton = require("./actions/sekleton");

function _electron() {
  const data = require("electron");

  _electron = function _electron() {
    return data;
  };

  return data;
}

var native = _interopRequireWildcard(require("./actions/native"));

var _bridge = require("./actions/bridge");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//const { BrowserWindow, app } = require('electron');
class electronWindowsManager {
  constructor(windowManagerConfig) {
    this.windowsList = void 0;
    this.totalIdleWindowsNum = void 0;
    this.baseWindowConfig = void 0;
    this.webPreferences = void 0;
    this.resourceDir = void 0;
    this.bridge = _bridge.bridge;
    this.totalIdleWindowsNum = windowManagerConfig ? windowManagerConfig.totalIdleWindowsNum : 4; // 允许空闲的窗口数量

    this.windowsList = new Map(); // 窗口容器

    this.webPreferences = windowManagerConfig ? windowManagerConfig.webPreferences : {}; // global.path.resourceDir

    this.resourceDir = windowManagerConfig ? windowManagerConfig.resourceDir : "";
    this.baseWindowConfig = _objectSpread({
      show: false,
      transparent: false,
      frame: true,
      showByClient: true,
      isBoolWindow: true,
      showFirst: false
    }, windowManagerConfig === null || windowManagerConfig === void 0 ? void 0 : windowManagerConfig.baseWindowConfig); // 单例模式

    if (electronWindowsManager.__Instance === undefined) {
      electronWindowsManager.__Instance = this;
    }

    return electronWindowsManager.__Instance;
  }
  /**
   * 初始化窗口管理,创建出允许的空闲窗口数
   */


  initIdleWindow() {
    var _this = this;

    return _asyncToGenerator(function* () {
      // 初始化窗口到给定水平
      for (let i = _this.windowsList.size; i < _this.totalIdleWindowsNum; i++) {
        yield _this.createIdleWindow({});
      }
    })();
  }
  /**
   * 创建单个空闲窗口
   * @param {windowsManager.userConfig} options
   */


  createIdleWindow(params) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let userOptions = params.userOptions,
          windowOptions = params.windowOptions,
          webPreferences = params.webPreferences;

      if (!userOptions) {
        userOptions = {
          name: "",
          isCache: true
        };
      }

      if (_this2.windowsList.size === _this2.totalIdleWindowsNum) {
        return _this2.useIdleWindow(userOptions);
      } else {
        // 是否需要删除属性，该属性会传入electron.BrowserWindow中构造窗口
        // delete options.name;
        // delete options.component;
        const windowId = yield native.createWindow(Object.assign({}, _this2.baseWindowConfig, windowOptions), webPreferences || _this2.webPreferences);

        let window = _this2.getWindowById(windowId);

        window.on("close", e => {
          // Macos uses hide is very nice;
          // fix: use minimize to simulate BrowserWindow.hide
          if (!userOptions) {
            throw new Error("userOptions 不存在");
          }

          if (userOptions.isCache || userOptions.isCache === undefined) {
            if (!(native.getMainWindow() === windowId && native.getWillQuitApp() === true)) {
              e.preventDefault();

              if (process.platform.startsWith("win")) {
                var _window, _window2;

                (_window = window) === null || _window === void 0 ? void 0 : _window.minimize();
                (_window2 = window) === null || _window2 === void 0 ? void 0 : _window2.setSkipTaskbar(true);
              } else {
                var _window3;

                (_window3 = window) === null || _window3 === void 0 ? void 0 : _window3.hide();
              }
            }
          }
        });
        window.on("closed", () => {
          console.log("closed");

          if (native.getMainWindow() === windowId) {
            _this2.closeAllWindows();
          }

          window = null;

          _this2.windowsList.delete(windowId);
        });
        window.on("page-title-updated", (e, title) => {
          e.preventDefault();
          console.log("title", title);
        });
        let windowConfig = {
          isOpen: false,
          name: userOptions.name,
          // 传消息
          // sendMsg: {},
          // backMsg: {},
          isMain: false,
          winId: windowId
        };

        if (userOptions && userOptions.isOpenSekleton) {
          userOptions["resourceDir"] = _this2.resourceDir;
          windowConfig = Object.assign(windowConfig, {
            view: (0, _sekleton.setSekleton)(window, userOptions.Sekleton, userOptions.resourceDir)
          });
        }

        if (userOptions.url) {
          window.loadURL(userOptions.url);
        } else {
          if (userOptions.file) {
            window.loadFile(userOptions.file);
          }
        } // 设置传参


        _this2.windowsList.set(windowId, windowConfig); // window.on("ready-to-show", () => {
        //   console.log("ready-to-show");
        //   closeSekleton(window, this.getWindowInfoById(windowId));
        // });


        return window;
      }
    })();
  }
  /**
   * 添加窗口到管理列表
   * @param {windowsManager.windowList} windowInfo
   */


  addWindow(parmas) {
    let windowInfo = parmas.windowInfo,
        userOptions = parmas.userOptions;
    const window = this.getWindowById(windowInfo.winId);
    let windowConfig = windowInfo;
    window.on("close", e => {
      e.preventDefault();

      if (native.getMainWindow() === windowInfo.winId && native.getWillQuitApp() === true) {
        this.closeAllWindows(); // app.quit();
      } else {
        window.hide();
      }
    });

    if (userOptions && userOptions.isOpenSekleton) {
      userOptions["resourceDir"] = userOptions["resourceDir"] || this.resourceDir;
      windowConfig = Object.assign(windowConfig, {
        view: (0, _sekleton.setSekleton)(window, userOptions.Sekleton, userOptions.resourceDir)
      });
    } // 设置传参


    this.windowsList.set(windowInfo.winId, windowConfig); // window.on("ready-to-show", () => {
    //   console.log("ready-to-show");
    //   closeSekleton(window, windowConfig);
    // });
  }
  /**
   * 设置自定义配置
   */


  setConfig(windowManagerConfig) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.totalIdleWindowsNum = windowManagerConfig.totalIdleWindowsNum || 4; // 允许空闲的窗口数量
      // global.path.resourceDir

      _this3.resourceDir = windowManagerConfig.resourceDir || "";
      _this3.baseWindowConfig = windowManagerConfig.baseWindowConfig ? Object.assign(_this3.baseWindowConfig, windowManagerConfig.baseWindowConfig) : _this3.baseWindowConfig;
      _this3.webPreferences = windowManagerConfig.webPreferences ? Object.assign(_this3.webPreferences, windowManagerConfig.webPreferences) : _this3.webPreferences;
    })();
  }
  /**
   * 使用空白的窗口，用来预渲染目标内容,但不显示
   */


  useIdleWindow(options) {
    // 判断参数是否有name和refresh属性（如果有name属性查找该name窗口是否存在，存在显示不存在新建）
    let idleWindowInfo, idleWindow, windowId;

    if (options.name) {
      // 查询是否有该name窗口存在
      idleWindowInfo = this.getWindowInfoById(this.getWindowIdByName(options.name)); //  不存在name窗口

      if (!idleWindowInfo) {
        windowId = this.getIdleWindow(); //不存在窗口

        if (!windowId) {
          throw new Error("没有窗口可用");
        }

        idleWindowInfo = this.getWindowInfoById(windowId);
        idleWindow = this.getWindowById(windowId);

        if (options && options.isOpenSekleton) {
          options["resourceDir"] = this.resourceDir;
          idleWindowInfo = Object.assign(idleWindowInfo, {
            view: (0, _sekleton.setSekleton)(idleWindow, options.Sekleton, options.resourceDir)
          });
        } // 路由跳转 覆盖原本的name内容


        idleWindowInfo.name = options.name;
      } else {
        windowId = idleWindowInfo.winId;
        idleWindow = this.getWindowById(idleWindowInfo.winId);
      } // 是否需要优化，同name窗口时判断是否需要重新载入


      this.urlChange(windowId, options.url, options.file); // 更新队列

      this.refreshIdleWindowInfo(idleWindowInfo, idleWindowInfo.winId);
      return idleWindow;
    } else {
      throw new Error("需要窗口目标信息");
    }
  }
  /**
   * 显示目标窗口，并把状态设置为使用
   */


  openTargetWindow(options) {
    // 不存在时如何处理
    const windowId = this.getWindowIdByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId); // 主窗如果是代码强行指定可能会出现在这里，该打开还是打开

    if (windowInfo) {
      const windowTarget = this.getWindowById(windowId); // lru移动

      windowInfo.isOpen = true; // 更新队列

      this.refreshIdleWindowInfo(windowInfo, windowId);
      windowTarget.show();
    } else {
      this.useIdleWindow(options);
      this.openTargetWindow(options);
    }
  }
  /**
   * 隐藏目标窗口，并把状态设置为未使用
   */


  closeTargetWindow(options) {
    const windowId = this.getWindowIdByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId);

    if (native.getMainWindow() === windowId && native.getWillQuitApp() === true) {
      this.closeAllWindows();
    } else {
      if (windowInfo) {
        // 窗口基础状态
        this.getWindowById(windowId).close(); // lru移动

        windowInfo.isOpen = false; // 更新队列

        this.refreshIdleWindowInfo(windowInfo, windowId);
      } else {
        throw new Error("没有删除的目标");
      }
    }
  }
  /**
   * 关闭所有窗口
   * @param {}
   */


  closeAllWindows() {
    this.windowsList.forEach((value, key) => {
      if (key !== native.getMainWindow()) {
        const window = this.getWindowById(key);
        window.removeAllListeners("close");
        this.getWindowById(key).close();
      }
    });
  }
  /**
   * 路由跳转，主要为复用窗口切换显示内容用
   */


  urlChange(idelWindowId, url, file) {
    const window = this.getWindowById(idelWindowId); // const reg = RegExp("(http|https|ucf)://.*");
    // let url: string;
    // if (!this.authority) {
    //   console.log(Error("没有路由地址"));
    // } else {
    //   url = (
    //     reg.test(options.component || "")
    //       ? options.component
    //       : `${this.authority}/${options.path ? options.path : this.path}?${
    //           this.baseUrlInfo[0]
    //         }=${options.name}&${this.baseUrlInfo[1]}=${options.component}`
    //   )!;
    //   window.webContents.reloadIgnoringCache();
    //   if (options && options.isOpenSekleton) {
    //     options["resourceDir"] = this.resourceDir;
    //     this.windowsList.set(
    //       idelWindowId,
    //       Object.assign(this.windowsList.get(idelWindowId), {
    //         view: setSekleton(window, options),
    //       })
    //     );
    //   }
    //   window.loadURL(url);
    // }

    if (url) window.loadURL(url);else if (file) window.loadFile(file);else {
      console.log("没有跳转路径");
    }
  }
  /**
   * 更新维护的窗口管理队列
   */


  refreshIdleWindowInfo(windowInfo, winowId) {
    this.getWindowById(winowId).setTitle(windowInfo.name);
    this.windowsList.delete(winowId);
    this.windowsList.set(winowId, windowInfo);
  }
  /**
   * 获得一个可被使用的窗口，可能是idle的也可能是lru置换下来的
   */


  getIdleWindow() {
    let windowId = -1;
    this.windowsList.forEach((value, key) => {
      if (value.isOpen === false) {
        windowId = key;
      }
    }); // 都在被使用，寻找到最后使用的窗口进行替换

    if (windowId <= 0) {
      var _this$windowsList$get;

      // 找到第一个最近未使用的窗口
      const keys = this.windowsList.keys();
      windowId = keys.next().value; // isOpen 的窗口肯定不在前列

      if ((_this$windowsList$get = this.windowsList.get(windowId)) === null || _this$windowsList$get === void 0 ? void 0 : _this$windowsList$get.isMain) {
        return keys.next().value;
      } else return windowId;
    } else {
      return windowId;
    }
  }
  /**
   * 通过window的id去获得window的信息和窗口对象的引用
   */


  getWindowInfoById(id) {
    return this.windowsList.get(id);
  }
  /**
   * 通过window的name去获得window的信息和对窗口的引用
   * @param {string} name
   * @returns Boolean|number
   */


  getWindowIdByName(name) {
    let windowId = -1;
    this.windowsList.forEach((value, key) => {
      if (value.name === name) {
        windowId = key;
      }
    });

    if (windowId >= 0) {
      return windowId;
    } else {
      return -1;
    }
  }
  /**
   * 获得windowlist
   * @returns array
   */


  getWindowList() {
    // let res: (number | windowList)[][] = []
    let res = [];
    this.windowsList.forEach((value, key) => {
      res.push([key, value]);
    });
    return res;
  }
  /**
   * 通过name设置为主窗口
   */


  WMsetMainWindow(name) {
    const windowId = this.getWindowIdByName(name);

    if (windowId !== -1) {
      let windowInfo = this.windowsList.get(windowId);

      if (windowInfo) {
        windowInfo.isMain = true;
        this.windowsList.set(windowId, windowInfo);
        native.setMainWindow(windowId);
        return true;
      } else {
        //只要是窗口管理打开的窗口，id存在则窗口队列里肯定有windowInfo，安全起见此处做一个判断
        console.log("此窗口不存在于窗口管理队列");
        return false;
      }
    } else {
      console.log("找不到对应窗口");
      return false;
    }
  }
  /**
   * 通过id获得window对象
   */


  getWindowById(id) {
    return _electron().BrowserWindow.fromId(id);
  }
  /**
   * 通过name获得window对象
   */


  getWindowByName(name) {
    return _electron().BrowserWindow.fromId(this.getWindowIdByName(name));
  }

  closeSekleton(name) {
    (0, _sekleton.closeSekleton)(this.getWindowByName(name), this.getWindowInfoById(this.getWindowIdByName(name)));
  }

  setQuitMode(mode) {
    native.setQuitMode(mode);
  }

}

exports.default = electronWindowsManager;
electronWindowsManager.__Instance = void 0;