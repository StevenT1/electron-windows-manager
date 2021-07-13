"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.electronWindowsManager = void 0;

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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

class electronWindowsManager {
  // native里的函数能否更加通用化一些
  constructor(config) {
    this.windowsList = void 0;
    this.componentList = void 0;
    this.totalIdleWindowsNum = void 0;
    this.native = void 0;
    this.baseUrlInfo = void 0;
    this.hostName = void 0;
    this.baseWindowConfig = void 0;
    this.resourceDir = void 0;
    this.totalIdleWindowsNum = config.totalIdleWindowsNum || 4; // 允许空闲的窗口数量

    this.baseUrlInfo = config.urlInfo || [];
    this.windowsList = new Map(); // 窗口容器

    this.componentList = new Map(); // global.path.resourceDir

    this.resourceDir = config.resourceDir;
    this.baseWindowConfig = {
      show: false,
      transparent: false,
      frame: true,
      showByClient: true,
      isBoolWindow: true,
      showFirst: config.showFirst
    };
    this.hostName = config.hostName;
    this.baseUrlInfo = ['name', 'component'];
    this.native = config.native; // 单例模式

    if (electronWindowsManager.__Instance === undefined) {
      this.initIdleWindow();
      electronWindowsManager.__Instance = this;
    }

    return electronWindowsManager.__Instance;
  }
  /**
   * 初始化窗口管理,创建出允许的空闲窗口数
   */


  initIdleWindow() {
    // 初始化窗口到给定水平
    for (let i = this.windowsList.size; i <= this.totalIdleWindowsNum; i++) {
      this.createIdleWindow();
    }
  }
  /**
   * 创建单个空闲窗口
   */


  createIdleWindow(options) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.windowsList.size > _this.totalIdleWindowsNum) {
        _this.useIdleWindow(options);
      } else {
        const targetWindowName = options === null || options === void 0 ? void 0 : options.name;
        const targetWindowComponent = options === null || options === void 0 ? void 0 : options.component; // 是否需要删除属性，该属性会传入electron.BrowserWindow中构造窗口
        // delete options.name;
        // delete options.component;

        const windowInfo = yield _this.native.createWindow(Object.assign({}, _this.baseWindowConfig, options));

        let window = _this.getWindowById(windowInfo.id);

        window.on('close', e => {
          e.preventDefault();

          if (_this.native.getMainWindow() === windowInfo.id) {
            _electron().app.quit();
          } else {
            window.hide();
          }
        }); // 设置传参

        _this.windowsList.set(windowInfo.id, {
          isOpen: false,
          name: targetWindowName,
          component: targetWindowComponent,
          // 传消息
          // sendMsg: {},
          // backMsg: {},
          isMain: false,
          winId: windowInfo.id
        });

        window.on('ready-to-show', () => {
          console.log('ready-to-show');

          _this.closeSekleton(windowInfo.id);
        });
      }
    })();
  }
  /**
   * 添加窗口到管理列表
   * @param {windowsManager.windowList} windowInfo
   */


  addWindow(windowInfo, options) {
    const window = this.getWindowById(windowInfo.winId);
    window.on('close', e => {
      e.preventDefault();

      if (this.native.getMainWindow() === windowInfo.winId) {
        _electron().app.quit();
      } else {
        window.hide();
      }
    }); // 设置传参

    this.windowsList.set(windowInfo.winId, {
      isOpen: false,
      name: windowInfo.name,
      component: windowInfo.component,
      // 传消息
      // sendMsg: {},
      // backMsg: {},
      isMain: windowInfo.isMain,
      winId: windowInfo.winId
    });
    this.setSekleton(windowInfo.winId, options); // window.on('ready-to-show', () => {
    //   console.log('ready-to-show');
    //   this.closeSekleton(windowInfo.winId)
    // })
  }
  /**
   * 设置自定义配置
   */


  setConfig(config) {
    this.totalIdleWindowsNum = config.totalIdleWindowsNum || 4; // 允许空闲的窗口数量

    this.baseUrlInfo = config.urlInfo || []; // global.path.resourceDir

    this.resourceDir = config.resourceDir;
    this.baseWindowConfig = Object.assign(this.baseWindowConfig, config.baseWindowConfig);
    this.hostName = config.hostName;
    this.baseUrlInfo = ['name', 'component'];
  }
  /**
   * 设置骨架屏
   * @param {number} id 
   * @param {windowsManager.userConfig} options
   */


  setSekleton(id, options) {
    const window = this.getWindowById(id);
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
    let fileUrl = '';

    if (options) {
      if (!options.skeleton) {
        fileUrl = `${this.resourceDir}/loading.html`;
      } else {
        fileUrl = `${this.resourceDir}/${options.skeleton}`;
      }
    }

    browserView.webContents.loadFile(fileUrl);
    this.windowsList.set(id, Object.assign(this.windowsList.get(id), {
      view: browserView
    }));
  }
  /**
   * 关闭骨架屏信息
   */


  closeSekleton(id) {
    const window = this.getWindowById(id);
    const windowInfo = this.windowsList.get(id);

    if (windowInfo) {
      if (!windowInfo.view) {
        return '该窗口没有骨架屏';
      } else {
        console.log('stop');
        window.removeBrowserView(windowInfo.view);
        return true;
      }
    } else {
      return '该窗口id不在管理内';
    }
  }
  /**
   * 使用空白的窗口，用来预渲染目标内容,但不显示
   */


  useIdleWindow(options) {
    // 判断参数是否有name和refresh属性（如果有name属性查找该name窗口是否存在，存在显示不存在新建）
    let idleWindowInfo, idleWindow;

    if (options.name) {
      // // 查询是否有该name窗口存在
      // idleWindowId = this.getWindowInfoByName(options.name);
      // // 不存在name窗口
      // if (idleWindowId == -1) {
      //   idleWindowId = this.getIdleWindow();
      // }
      // // 存在name窗口
      // idleWindowInfo = this.getWindowInfoById(idleWindowId)!;
      // this.componentList.set(options.name, options.component);
      // // 路由跳转 覆盖原本的内容
      // this.urlChange(idleWindowId, options);
      // // 更新队列
      // idleWindowInfo.name = options.name;
      // idleWindowInfo.component = options.component;
      // 查询是否有该name窗口存在
      idleWindowInfo = this.getWindowInfoById(this.getWindowInfoByName(options.name)); //  不存在name窗口

      if (!idleWindowInfo) {
        const windowId = this.getIdleWindow();
        idleWindowInfo = this.getWindowInfoById(windowId);
        idleWindow = this.getWindowById(windowId); // 路由跳转 覆盖原本的name内容

        idleWindowInfo.name = options.name;
        idleWindowInfo.component = options.component || this.componentList.get(options.name);
        options.component && this.componentList.set(options.name, options.component); // 是否需要优化，同name窗口时判断是否需要重新载入

        this.urlChange(windowId, options);
      } // 更新队列


      this.refreshIdleWindowInfo(idleWindowInfo, idleWindowInfo.winId);
    } else {
      throw new Error('需要窗口目标信息');
    }
  }
  /**
   * 显示目标窗口，并把状态设置为使用
   */


  openTargetWindow(options) {
    // 不存在时如何处理
    const windowId = this.getWindowInfoByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId);
    options.component = this.componentList.get(options.name); // 主窗如果是代码强行指定可能会出现在这里，该打开还是打开

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
    const windowId = this.getWindowInfoByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId);

    if (this.native.getMainWindow() === windowId) {
      _electron().app.quit();
    } else {
      if (windowInfo) {
        // 窗口基础状态
        this.getWindowById(windowId).close(); // lru移动

        windowInfo.isOpen = false; // 更新队列

        this.refreshIdleWindowInfo(windowInfo, windowId);
      } else {
        throw new Error('没有删除的目标');
      }
    }
  }
  /**
   * 路由跳转，主要为复用窗口切换显示内容用
   */


  urlChange(idelWindowId, options) {
    const window = this.getWindowById(idelWindowId);
    const reg = RegExp("(http|https|ucf):\/\/.*");
    let url;

    if (!this.hostName) {
      console.log(Error('没有路由地址'));
    } else {
      url = reg.test(options.component || '') ? options.component : `${options.hostname ? options.hostname : this.hostName}?${this.baseUrlInfo[0]}=${options.name}&${this.baseUrlInfo[1]}=${options.component}`;
      window.webContents.reloadIgnoringCache();
      this.setSekleton(idelWindowId, options);
      window.loadURL(url);
    }
  }
  /**
   * 更新维护的窗口管理队列
   */


  refreshIdleWindowInfo(windowInfo, winowId) {
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

    if (windowId >= 0) {
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


  getWindowInfoByName(name) {
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
    const windowId = this.getWindowInfoByName(name);

    if (windowId !== -1) {
      let windowInfo = this.windowsList.get(windowId);

      if (windowInfo) {
        windowInfo.isMain = true;
        this.windowsList.set(windowId, windowInfo);
        this.native.setMainWindow(windowId);
        return true;
      } else {
        //只要是窗口管理打开的窗口，id存在则窗口队列里肯定有windowInfo，安全起见此处做一个判断
        console.log('此窗口不存在于窗口管理队列');
        return false;
      }
    } else {
      return false;
    }
  }
  /**
   * 获得window对象
   */


  getWindowById(id) {
    return _electron().BrowserWindow.fromId(id);
  }

}

exports.electronWindowsManager = electronWindowsManager;
electronWindowsManager.__Instance = void 0;