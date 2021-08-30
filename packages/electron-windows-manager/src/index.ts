import { setSekleton, closeSekleton } from "./actions/sekleton";
import { app, BrowserWindow } from "electron";
import * as native from "./actions/native";
import { bridge } from "./actions/bridge";
//const { BrowserWindow, app } = require('electron');
export default class electronWindowsManager {
  static __Instance: electronWindowsManager;
  private windowsList: Map<number, windowsManager.windowList>;
  private totalIdleWindowsNum: number;
  private baseWindowConfig: windowsManager.baseWindowConfig;
  private webPreferences: Electron.WebPreferences | undefined;
  private resourceDir: string;
  public bridge = bridge;
  constructor(
    windowManagerConfig: windowsManager.windowManagerConfig | undefined
  ) {
    this.totalIdleWindowsNum = windowManagerConfig
      ? windowManagerConfig.totalIdleWindowsNum
      : 4; // 允许空闲的窗口数量
    this.windowsList = new Map(); // 窗口容器
    this.webPreferences = windowManagerConfig
      ? windowManagerConfig.webPreferences
      : {};
    // global.path.resourceDir
    this.resourceDir = windowManagerConfig
      ? windowManagerConfig.resourceDir
      : "";
    this.baseWindowConfig = {
      show: false,
      transparent: false,
      frame: true,
      showByClient: true,
      isBoolWindow: true,
      showFirst: false,
      ...windowManagerConfig?.baseWindowConfig,
    };
    // 单例模式
    if (electronWindowsManager.__Instance === undefined) {
      electronWindowsManager.__Instance = this;
    }
    return electronWindowsManager.__Instance;
  }

  /**
   * 初始化窗口管理,创建出允许的空闲窗口数
   */
  public async initIdleWindow(): Promise<void> {
    // 初始化窗口到给定水平
    for (let i = this.windowsList.size; i < this.totalIdleWindowsNum; i++) {
      await this.createIdleWindow({});
    }
  }

  /**
   * 创建单个空闲窗口
   * @param {windowsManager.userConfig} options
   */
  public async createIdleWindow(params: {
    userOptions?: windowsManager.userConfig;
    windowOptions?: windowsManager.baseWindowConfig;
    webPreferences?: Electron.WebPreferences;
  }) {
    
    let { userOptions, windowOptions, webPreferences } = params;
    if (!userOptions) {
      userOptions = {
        name: "",
        isCache: true,
      };
    }
    if (this.windowsList.size === this.totalIdleWindowsNum) {
      return this.useIdleWindow(userOptions);
    } else {
      // 是否需要删除属性，该属性会传入electron.BrowserWindow中构造窗口
      // delete options.name;
      // delete options.component;
      const windowId = await native.createWindow(
        Object.assign({}, this.baseWindowConfig, windowOptions),
        webPreferences || this.webPreferences
      );

      let window: Electron.BrowserWindow | null = this.getWindowById(windowId);
      window.on("close", (e) => {
        // Macos uses hide is very nice;
        // fix: use minimize to simulate BrowserWindow.hide
        if (!userOptions) {
          throw new Error("userOptions 不存在");
        }
        if (userOptions.isCache || userOptions.isCache === undefined) {
          if (
            !(
              native.getMainWindow() === windowId &&
              native.getWillQuitApp() === true
            )
          ) {
            e.preventDefault();
            if (process.platform.startsWith("win")) {
              window?.minimize();
              window?.setSkipTaskbar(true);
            } else {
              window?.hide();
            }
          }
        }
      });
      window.on("closed", () => {
        console.log("closed");

        if (native.getMainWindow() === windowId) {
          this.closeAllWindows();
        }
        window = null;
        this.windowsList.delete(windowId);
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
        winId: windowId,
      };
      if (userOptions && userOptions.isOpenSekleton) {
        userOptions["resourceDir"] = this.resourceDir;
        windowConfig = Object.assign(windowConfig, {
          view: setSekleton(
            window,
            userOptions.Sekleton,
            userOptions.resourceDir
          ),
        });
      }
      if (userOptions.url) {
        window.loadURL(userOptions.url);
      } else {
        if (userOptions.file) {
          window.loadFile(userOptions.file);
        }
      }
      // 设置传参
      this.windowsList.set(windowId, windowConfig);

      // window.on("ready-to-show", () => {
      //   console.log("ready-to-show");
      //   closeSekleton(window, this.getWindowInfoById(windowId));
      // });
      return window;
    }
  }

  /**
   * 添加窗口到管理列表
   * @param {windowsManager.windowList} windowInfo
   */
  public addWindow(parmas: {
    windowInfo: windowsManager.windowList;
    userOptions?: windowsManager.userConfig;
  }) {
    let { windowInfo, userOptions } = parmas;
    const window = this.getWindowById(windowInfo.winId);
    let windowConfig: windowsManager.windowList = windowInfo;
    window.on("close", (e) => {
      e.preventDefault();
      if (
        native.getMainWindow() === windowInfo.winId &&
        native.getWillQuitApp() === true
      ) {
        this.closeAllWindows();
        // app.quit();
      } else {
        window!.hide();
      }
    });
    if (userOptions && userOptions.isOpenSekleton) {
      userOptions["resourceDir"] =
        userOptions["resourceDir"] || this.resourceDir;
      windowConfig = Object.assign(windowConfig, {
        view: setSekleton(
          window,
          userOptions.Sekleton,
          userOptions.resourceDir
        ),
      });
    }
    // 设置传参
    this.windowsList.set(windowInfo.winId, windowConfig);
    // window.on("ready-to-show", () => {
    //   console.log("ready-to-show");
    //   closeSekleton(window, windowConfig);
    // });
  }

  /**
   * 设置自定义配置
   */
  public async setConfig(
    windowManagerConfig: windowsManager.windowManagerConfig
  ) {
    this.totalIdleWindowsNum = windowManagerConfig.totalIdleWindowsNum || 4; // 允许空闲的窗口数量
    // global.path.resourceDir
    this.resourceDir = windowManagerConfig.resourceDir || "";
    this.baseWindowConfig = windowManagerConfig.baseWindowConfig
      ? Object.assign(
          this.baseWindowConfig,
          windowManagerConfig.baseWindowConfig
        )
      : this.baseWindowConfig;
    this.webPreferences = windowManagerConfig.webPreferences
      ? Object.assign(this.webPreferences, windowManagerConfig.webPreferences)
      : this.webPreferences;
  }

  /**
   * 使用空白的窗口，用来预渲染目标内容,但不显示
   */
  public useIdleWindow(options: windowsManager.userConfig) {
    // 判断参数是否有name和refresh属性（如果有name属性查找该name窗口是否存在，存在显示不存在新建）
    let idleWindowInfo: windowsManager.windowList | undefined,
      idleWindow: Electron.BrowserWindow,
      windowId: number;
    if (options.name) {
      // 查询是否有该name窗口存在
      idleWindowInfo = this.getWindowInfoById(
        this.getWindowIdByName(options.name)
      );
      //  不存在name窗口
      if (!idleWindowInfo) {
        windowId = this.getIdleWindow();
        //不存在窗口
        if (!windowId) {
          throw new Error("没有窗口可用");
        }
        idleWindowInfo = this.getWindowInfoById(windowId)!;
        idleWindow = this.getWindowById(windowId);
        if (options && options.isOpenSekleton) {
          options["resourceDir"] = this.resourceDir;
          idleWindowInfo = Object.assign(idleWindowInfo, {
            view: setSekleton(
              idleWindow,
              options.Sekleton,
              options.resourceDir
            ),
          });
        }
        // 路由跳转 覆盖原本的name内容
        idleWindowInfo.name = options.name;
      } else {
        windowId = idleWindowInfo.winId;
        idleWindow = this.getWindowById(idleWindowInfo.winId);
      }
      // 是否需要优化，同name窗口时判断是否需要重新载入
      this.urlChange(windowId, options.url, options.file);
      // 更新队列
      this.refreshIdleWindowInfo(idleWindowInfo, idleWindowInfo.winId);
      return idleWindow;
    } else {
      throw new Error("需要窗口目标信息");
    }
  }

  /**
   * 显示目标窗口，并把状态设置为使用
   */
  public openTargetWindow(options: windowsManager.userConfig) {
    // 不存在时如何处理
    const windowId: number = this.getWindowIdByName(options.name);

    const windowInfo: windowsManager.windowList | undefined =
      this.getWindowInfoById(windowId);
    // 主窗如果是代码强行指定可能会出现在这里，该打开还是打开
    if (windowInfo) {
      const windowTarget: Electron.BrowserWindow = this.getWindowById(windowId);
      // lru移动
      windowInfo.isOpen = true;
      // 更新队列
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
  public closeTargetWindow(options: windowsManager.userConfig) {
    const windowId = this.getWindowIdByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId);

    if (
      native.getMainWindow() === windowId &&
      native.getWillQuitApp() === true
    ) {
      this.closeAllWindows();
    } else {
      if (windowInfo) {
        // 窗口基础状态
        this.getWindowById(windowId).close();
        // lru移动
        windowInfo.isOpen = false;
        // 更新队列
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
  public closeAllWindows() {
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
  private urlChange(idelWindowId: number, url?: string, file?: string) {
    const window = this.getWindowById(idelWindowId);
    // const reg = RegExp("(http|https)://.*");
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
    if (url) window.loadURL(url);
    else if (file) window.loadFile(file);
    else {
      console.log("没有跳转路径");
    }
  }

  /**
   * 更新维护的窗口管理队列
   */
  private refreshIdleWindowInfo(
    windowInfo: windowsManager.windowList,
    winowId: number
  ) {
    this.getWindowById(winowId).setTitle(windowInfo.name);
    this.windowsList.delete(winowId);
    this.windowsList.set(winowId, windowInfo);
  }

  /**
   * 获得一个可被使用的窗口，可能是idle的也可能是lru置换下来的
   */
  private getIdleWindow(): number {
    let windowId: number = -1;
    this.windowsList.forEach((value, key) => {
      if (value.isOpen === false) {
        windowId = key;
      }
    });

    // 都在被使用，寻找到最后使用的窗口进行替换
    if (windowId <= 0) {
      // 找到第一个最近未使用的窗口
      const keys: IterableIterator<number> = this.windowsList.keys();
      windowId = keys.next().value;
      // isOpen 的窗口肯定不在前列

      if (this.windowsList.get(windowId)?.isMain) {
        return keys.next().value;
      } else return windowId;
    } else {
      return windowId;
    }
  }

  /**
   * 通过window的id去获得window的信息和窗口对象的引用
   */
  public getWindowInfoById(id: number): windowsManager.windowList | undefined {
    return this.windowsList.get(id);
  }

  /**
   * 通过window的name去获得window的信息和对窗口的引用
   * @param {string} name
   * @returns Boolean|number
   */
  public getWindowIdByName(name: string): number {
    let windowId: number = -1;
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
  public getWindowList() {
    // let res: (number | windowList)[][] = []
    let res: Array<[number, windowsManager.windowList]> = [];
    this.windowsList.forEach((value, key) => {
      res.push([key, value]);
    });
    return res;
  }

  /**
   * 通过name设置为主窗口
   */
  public WMsetMainWindow(name: string) {
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
  public getWindowById(id: number): Electron.BrowserWindow {
    return BrowserWindow.fromId(id)!;
  }

  /**
   * 通过name获得window对象
   */
  public getWindowByName(name: string): Electron.BrowserWindow {
    return BrowserWindow.fromId(this.getWindowIdByName(name))!;
  }

  /**
   * 关闭指定name窗口的骨架屏
   */
  public closeSekleton(name: string) {
    closeSekleton(
      this.getWindowByName(name),
      this.getWindowInfoById(this.getWindowIdByName(name))
    );
  }
  /**
   * 设置主窗口关闭是否退出
   */
  public setQuitMode(mode: boolean) {
    native.setQuitMode(mode);
  }
}
