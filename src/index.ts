import { BrowserWindowConstructorOptions, BrowserWindow, BrowserView, app } from 'electron';
export class WindowsBox {
  private static __Instance: WindowsBox;
  private windowsList: Map<number, windowsManager.windowList>;
  private componentList: Map<string, string | undefined>;
  private totalIdleWindowsNum: number;
  private native: windowsManager.native;
  private baseUrlInfo: windowsManager.basePathName;
  private baseWindowConfig: windowsManager.baseWindowConfig;
  private resourceDir:string;
  private constructor(config: windowsManager.config) {
    this.totalIdleWindowsNum = 5; // 允许空闲的窗口数量
    this.windowsList = new Map(); // 窗口容器
    this.componentList = new Map();
    // global.path.resourceDir
    this.resourceDir = config.resourceDir;
    this.baseWindowConfig = {
      show: false,
      transparent: false,
      frame: true,
      showByClient: true,
      isBoolWindow: true,
      showFirst: false
    };
    this.baseUrlInfo = {
      hostname: '',
      pathname: []
    };
    this.native = config.native

    // 单例模式
    if (WindowsBox.__Instance === undefined) {
      WindowsBox.__Instance = this;
    }
    return WindowsBox.__Instance;
  }

  /**
   * 设置默认参数
   * @param {Object} config 
   * @returns null
   */
  public setConfig(config: windowsManager.userConfig) {
    this.totalIdleWindowsNum = config.totalIdleWindowsNum || 4;
    this.baseWindowConfig.showFirst = config.showFirst;
    this.baseUrlInfo = config.urlInfo || this.baseUrlInfo;
    // 初始化窗口
    this.initIdleWindow();
  }

  /**
   * 初始化窗口管理,创建出允许的空闲窗口数
   */
  private initIdleWindow(): void {
    // 初始化窗口到给定水平
    for (var i = this.windowsList.size; i <= this.totalIdleWindowsNum; i++) {
      this.createIdleWindow({ name: '' });
    }
  }

  /**
   * 创建单个空闲窗口
   */
  public async createIdleWindow(options: windowsManager.userConfig) {
    if (this.windowsList.size > this.totalIdleWindowsNum) {
      this.useIdleWindow(options)
    } else {
      const targetWindowName = options?.name;
      const targetWindowComponent = options?.component;
      // 是否需要删除属性，该属性会传入electron.BrowserWindow中构造窗口
      // delete options.name;
      // delete options.component;
      const windowInfo = await this.native.createWindow(Object.assign({}, this.baseWindowConfig, options));
      let window = this.getWindowById(windowInfo.id);
      this.setSekleton(windowInfo.id, options)
      window.on('close', (e) => {
        e.preventDefault();
        if (this.native.getMainWindow() === windowInfo.id) {
          app.quit();
        } else {
          window!.hide();
        }
      })
      // 设置传参
      this.windowsList.set(windowInfo.id, {
        isOpen: false,
        name: targetWindowName,
        component: targetWindowComponent,
        // 传消息
        // sendMsg: {},
        // backMsg: {},
        isMain: false,
        winId: windowInfo.id,
      });

    }
  }
  /**
   * 设置骨架屏
   * @param {number,userConfig} id 
   */
  public setSekleton(id: number, options?: windowsManager.userConfig) {
    const window = this.getWindowById(id)
    let view: BrowserView = new BrowserView();
    new BrowserView()
    window.setBrowserView(view);
    view.setAutoResize({ width: true, height: true, horizontal: true, vertical: true })
    view.webContents.loadFile(`${this.resourceDir}/${options?.skeleton !== undefined ? options.skeleton : 'loading.html'}`);
    view.webContents.on('dom-ready', () => {
      console.log('stop')
      window!.removeBrowserView(view);
      // view是否需要置空
    })
    return view
  }
  /**
   * 使用空白的窗口，用来预渲染目标内容,但不显示
   */
  public useIdleWindow(options: windowsManager.userConfig) {
    // 判断参数是否有name和refresh属性（如果有name属性查找该name窗口是否存在，存在显示不存在新建）
    let idleWindowInfo: windowsManager.windowList, idleWindowId: number;
    if (options.name) {
      // 查询是否有该name窗口存在
      idleWindowId = this.getWindowInfoByName(options.name);
      // 不存在name窗口
      if (idleWindowId == -1) {
        idleWindowId = this.getIdleWindow();
      }
      // 存在name窗口
      idleWindowInfo = this.getWindowInfoById(idleWindowId)!;
      this.componentList.set(options.name, options.component);
      // 路由跳转 覆盖原本的内容
      this.urlChange(idleWindowId, options, options.hostname);
      // 更新队列
      idleWindowInfo.name = options.name;
      idleWindowInfo.component = options.component;
      this.refreshIdleWindowInfo(idleWindowInfo, idleWindowInfo.winId);

    } else {
      throw (new Error('需要窗口目标信息'))
    }
  }

  /**
   * 显示目标窗口，并把状态设置为使用
   */
  public openTargetWindow(options: windowsManager.userConfig) {
    // 不存在时如何处理
    const windowId: number = this.getWindowInfoByName(options.name);
    const windowInfo: windowsManager.windowList | undefined = this.getWindowInfoById(windowId);
    options.component = this.componentList.get(options.name)
    // 主窗如果是代码强行指定可能会出现在这里，该打开还是打开
    if (windowInfo) {
      const window = this.getWindowById(windowId);
      // lru移动
      windowInfo.isOpen = true;
      // 更新队列
      this.refreshIdleWindowInfo(windowInfo, windowId)
      window.show();
    } else {
      this.useIdleWindow(options);
      this.openTargetWindow(options)
    }
  }

  /**
   * 隐藏目标窗口，并把状态设置为未使用
   */
  public closeTargetWindow(options: windowsManager.userConfig) {
    const windowId = this.getWindowInfoByName(options.name);
    const windowInfo = this.getWindowInfoById(windowId);

    if (this.native.getMainWindow() === windowId) {
      app.quit()
    } else {
      if (windowInfo) {
        // 窗口基础状态
        this.getWindowById(windowId).close();
        // lru移动
        windowInfo.isOpen = false;
        // 更新队列
        this.refreshIdleWindowInfo(windowInfo, windowId)
      } else {
        throw (new Error('没有删除的目标'))
      }
    }
  }

  /**
   * 路由跳转，主要为复用窗口切换显示内容用
   */
  private urlChange(idelWindowId: number, options: windowsManager.userConfig, hostname?: string) {
    const window = this.getWindowById(idelWindowId);
    const reg = RegExp("(http|https|ucf):\/\/.*");
    let url: string;
    if (!this.baseUrlInfo.hostname) {
      console.log(Error('没有路由地址'));
    } else {
      url = (reg.test(options.component || '') ? options.component : `${hostname ? hostname : this.baseUrlInfo.hostname}?${this.baseUrlInfo.pathname[0]}=${options.name}&${this.baseUrlInfo.pathname[1]}=${options.component}`)!
      window.webContents.reloadIgnoringCache();
      this.setSekleton(idelWindowId, options);
      window.loadURL(url)
    }
  }

  /**
   * 更新维护的窗口管理队列
   */
  private refreshIdleWindowInfo(windowInfo: windowsManager.windowList, winowId: number) {
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
    if (windowId >= 0) {
      // 找到第一个最近未使用的窗口
      const keys: IterableIterator<number> = this.windowsList.keys();
      windowId = keys.next().value;
      // isOpen 的窗口肯定不在前列
      if (this.windowsList.get(windowId)?.isMain) {
        return keys.next().value;
      } else
        return windowId;
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
   * @param {*} name 
   * @returns Boolean|number
   */
  public getWindowInfoByName(name: string): number {
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
    let res: Array<[number, windowsManager.windowList]> = []
    this.windowsList.forEach((value, key) => {
      res.push([key, value])
    })
    return res
  }
  /**
   * 通过name设置为主窗口
   */
  public WMsetMainWindow(name: string) {
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
        return false
      }
    } else {
      return false;
    }
  }
  /**
   * 获得window对象
   */
  public getWindowById(id: number): BrowserWindow {
    return BrowserWindow.fromId(id)!
  }
}