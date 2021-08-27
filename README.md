# electron-windows-manager

窗口管理 具备窗口管理功能，窗口缓存功能

# 使用说明

<!-- [![NPM](https://nodei.co/npm/electron-window-manager.png?downloads=true)](https://www.npmjs.com/package/electron-window-manager) -->

## 此物用途

> 一个为 [Electron](https://electronjs.org) 程序中多个窗口提供开窗，管理，缓存，骨架屏功能等帮助的模块。

如果你要构建一个多窗口的 Electron 应用程序，那么我们可能需要一个窗口管理工具，这个包就是为此而生的。

<!-- * [预览](#预览) -->

- [安装](#安装)
- [具体内容](#具体内容)
- [Class: electronWindowsManager](#class-electronWindowsManager)
- [Final notes and upcoming updates](#final-notes)

---

<!-- ## 预览 -->

## 安装

只需在程序终端中输入：

```sh
npm install --save electron-window-manager
```

然后在你的`main.js`中添加 _（或者你自己定义的）_ 这个引用:

```javascript
const electronWindowsManager = require("electron-window-manager");
```

现在，窗口管理模块可以在 electron 的*主进程*和*渲染进程*中使用。在*主进程*中，你可以使用它来创建应用程序的第一个主窗口，然后，在*渲染进程*中，你可以创建应用程序的其他窗口，或者其他你喜欢的方式。

**主进程中如下：**

```javascript
const { app, BrowserWindow, ipcMain } = require("electron");
const electronWindowsManager = require("electron-window-manager").default;
const electronWindowsManager = new electronWindowsManager({
  totalIdleWindowsNum: 4,
  // 静态文件路径
  resourceDir: `${path.resolve(__dirname, "..")}/resource`,
  baseWindowConfig: {},
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  },
});
// When the application is ready
app.on("ready", async () => {
  await windowManager.createIdleWindow({
    userOptions: {
      name: "main",
      file: path.join(__dirname, "index.html"),
      isOpenSekleton: false,
    },
    windowOptions: { show: true, showFirst: true },
  });
  console.log(windowManager.WMsetMainWindow("main"));
  windowManager.createIdleWindow({
    userOptions: {
      name: "google",
      url: "https://www.google.com",
      isOpenSekleton: true,
    },
    windowOptions: { show: false, showFirst: true },
  });
  //....
  // ipc
  ipcMain.on("windowManager", (event, arg) => {
    console.log("ipcMain", arg.params);
    windowManager[arg.func](arg.params);
  });
  ipcMain.on("print", (event, arg) => {
    windowManager.getWindowByName(arg.name).webContents.printToPDF();
  });
});
```

**渲染进程通过 ipcRenderer 调用模块功能 (包括创建窗口):**

```javascript
<script>
  const { ipcRenderer } = require('electron')
  document.getElementById('create').addEventListener('click', function () {
    ipcRenderer.send('windowManager', {
      func: 'createIdleWindow',
      params: {
        userOptions: {
          name: "blog",
          url: 'https://qiupo.github.io/',
          isOpenSekleton: true,
          isCache: false
        },
        windowOptions: { height: 600, width: 600, show: true, showFirst: true },
        webPreferences: {}
        // isOpenSekleton: true
      }
    });
    setTimeout(() => ipcRenderer.send('windowManager', {
      func: 'closeSekleton',
      params: 'blog'
    }), 1000)
  }, false);
  document.getElementById('open').addEventListener('click', function () {
    ipcRenderer.send('windowManager', {
      func: 'openTargetWindow',
      params: { name: 'google' }
    });
    setTimeout(() => ipcRenderer.send('windowManager', {
      func: 'closeSekleton',
      params: 'google'
    }), 1000)
  }, false);

</script>
```

## 具体内容

- **这个模块是 electron 的' BrowserWindow ' 模块的功能封装**，可以通过[BrowserWindow 的文档](https://electronjs.org/docs/api/browser-window)了解 electron 自身的 BrowserWindow 的 Api。
- 通过在模块内维护一个窗口的队列，添加或者通过模块创建 BrowserWindow 对象到 Map 对象中，通过唯一标识**name**进行指定窗口的操作。
- **BrowserWindow 实例可以在模块中建立或者外部建立后添加入 Map 对象中实现管理**，然后在此基础上扩展并添加更多诸如缓存，骨架屏的功能。
- 当创建一个新的窗口，你需要提供一个基于“ BrowserWindow ”提供的设置选项，如宽度，高度，标题，url…等，并且模块还增加了一些其他基本的设置。**一般情况下会通过初始化传入的配置进行窗口创建，如果有其他需求，可以自己调用窗口创建 API 进行特殊配置窗口创建**
- 在一个窗口创建后，你可以改变它的内容，调整它的大小，移动它，全屏它，甚至你可以从另一个窗口对其他窗口实现操作。

---

# API

## Class: electronWindowsManager

' electronWindowsManager '类是模块的接口，通过它你可以访问已经创建的窗口，当然也可以创建新的窗口。还可以通过它访问模块内部使用的所有内容。

### `initIdleWindow()`

此方法将初始化创建预设窗口数的窗口,达到窗口池的作用。

### `createIdleWindow(params)`

此方法是模块提供的创建窗口的方法。

- **params**

  - **userOptions**

    - **name** (string): 用以标识的窗口 name，具有唯一性，同时也是窗口的标题，以此为依据判断同一窗口再次开启时是否需要替换内容.
    - **url** (string): 窗口加载的地址.
    - **file** (string): 窗口加载的本地文件地址
    - **totalIdleWindowsNum** (number): 窗口管理的窗口上限
    - **Sekleton** (string): 骨架屏文件名
    - **resourceDir** (string): 静态文件地址
    - **isOpenSekleton** (boolean): 是否开启骨架屏设置
    - **isCache** (boolean): 是否开启此窗口的缓存

  - **windowOptions**
    - **showByClient** (boolean): 是否由用户决定显示窗口
    - **showFirst** (boolean): 窗口是否第一时间展示出来
    - **preloadPath** (string):  preload 地址
    - **maximize** (boolean): 是否最小化
    - **other** 参考[electron.BrowserWindow](https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions)的配置
  - **webPreferences**
    参考[electron.BrowserWindow](https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions)的配置、

🌰:

```javascript
electronWindowsManager.createIdleWindow(
  {
    name: "main",
    file: path.join(__dirname, "index.html"),
    isOpenSekleton: false,
  },
  {
    show: true,
    showFirst: true,
    preloadPath: "./preload.js",
  }
);
```

---

### `addWindow( params )`

This method sets the default setup for the application windows, it basically creates a new setup template with the name "default", and marks it as the default. Example:

- **params**
  - **windowInfo**
    - **name** (string):用以标识的窗口 name，具有唯一性，同时也是窗口的标题，以此为依据判断同一窗口再次开启时是否需要替换内容.
    - **isOpen** (boolean):窗口是否处于开启状态
    - **isMain** (boolean):是否是主窗口页面
    - **winId** (number):窗口的 ID
    - **view** (Electron.BrowserView):窗口的 view 内容，主要用于骨架屏内容
  - **userOptions**
    见 createIdleWindow。

🌰：

```javascript
electronWindowsManager.addWindow({
  windowInfo: {
    name: "main",
    isOpen: true,
    isMain: true,
    winId: 1,
    view: null,
  },
  userOptions: {
    file: path.join(__dirname, "index.html"),
    isOpenSekleton: false,
  },
});
```

---

### `setConfig( windowManagerConfig )`

设置窗口的基础自定义配置

- **windowManagerConfig**
  - **windowInfo**
    - **totalIdleWindowsNum** (number): 窗口管理的窗口上限
    - **baseWindowConfig** (baseWindowConfig):基础的窗口配置信息
    - **resourceDir** (string):静态文件路径
    - **winId** (number):窗口的 ID
    - **webPreferences**
      参考[electron.BrowserWindow](https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions)的配置

---

### `useIdleWindow( options )`

使用空白的窗口，用来渲染目标内容，可以设置是否显示

- **options**
  - **isCache** (boolean): 窗口是否缓存
  - **name** (string): 用以标识的窗口 name，具有唯一性，同时也是窗口的标题，以此为依据判断同一窗口再次开启时是否需要替换内容.
  - **url** (string):url 路径的跳转地址
  - **file** (number):本地文件路径的跳转地址
  - **Sekleton**(string):自定义骨架屏的文件名称
  - **resourceDir** (string):静态文件路径
  - **isOpenSekleton** (boolean): 是否开启骨架屏设置

---

### `openTargetWindow( options )`

显示目标窗口，并把状态设置为使用

- **options**
  与 useIdleWindow 配置相同

---

### `closeAllWindows( )`

关闭所有窗口

---

### `getWindowInfoById( id )`

通过 window 的 id 去获得 window 的信息和窗口对象的引用

- **id** (number): 窗口 id

---

### `getWindowIdByName( name )`

通过 window 的 name 去获得 window 的信息和对窗口的引用

- **name**(string):窗口唯一标识名

---

### `getWindowList( )`

获得 windowlist 转换成数组

---

### `WMsetMainWindow( name )`

通过 name 设置为主窗口

- **name**(string):窗口唯一标识名

---

### `getWindowById( id )`

通过 id 获得 window 对象

- **id** (number): 窗口 id

---

### `getWindowByName( name )`

通过 name 获得 window 对象

- **name**(string):窗口唯一标识名

---

### `closeSekleton( name )`

关闭指定 name 窗口的骨架屏

- **name**(string):窗口唯一标识名

---

### `setQuitMode( mode )`

设置主窗口关闭是否退出

- **mode**(boolean): 是否退出的标识

---

## Final notes

如有问题请提 issue

## License

[MIT License](https://github.com/qiupo/electron-windows-manager/blob/master/LICENSE)
