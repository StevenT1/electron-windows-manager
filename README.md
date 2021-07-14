# electron-windows-manager
electron's windows manager which can provide methods to solve confusion problem

## 使用说明
```
const { electronWindowsManager } = require('electron-windows-manager');

const windowsMangerObject = new electronWindowsManager({
  native: require('./native'),
  resourceDir: global.path.resourceDir,
})
```
