"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlatformToString = PlatformToString;
exports.isLittleEndian = isLittleEndian;
exports.OS = exports.OperatingSystem = exports.setImmediate = exports.translationsConfigFile = exports.locale = exports.Language = exports.language = exports.userAgent = exports.platform = exports.isIOS = exports.isWeb = exports.isNative = exports.isLinuxSnap = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.Platform = exports.isPreferringBrowserCodeLoad = exports.browserCodeLoadingCacheStrategy = exports.isElectronSandboxed = exports.globals = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _nodeProcess, _nodeProcess$versions, _nodeProcess2;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const LANGUAGE_DEFAULT = 'en';
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isLinuxSnap = false;
let _isNative = false;
let _isWeb = false;
let _isIOS = false;
let _locale = undefined;
let _language = LANGUAGE_DEFAULT;
let _translationsConfigFile = undefined;
let _userAgent = undefined;
const globals = typeof self === 'object' ? self : typeof global === 'object' ? global : {};
exports.globals = globals;
let nodeProcess = undefined;

if (typeof process !== 'undefined') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
} else if (typeof globals.vscode !== 'undefined') {
  // Native environment (sandboxed)
  nodeProcess = globals.vscode.process;
}

const isElectronRenderer = typeof ((_nodeProcess = nodeProcess) === null || _nodeProcess === void 0 ? void 0 : (_nodeProcess$versions = _nodeProcess.versions) === null || _nodeProcess$versions === void 0 ? void 0 : _nodeProcess$versions.electron) === 'string' && nodeProcess.type === 'renderer';
const isElectronSandboxed = isElectronRenderer && ((_nodeProcess2 = nodeProcess) === null || _nodeProcess2 === void 0 ? void 0 : _nodeProcess2.sandboxed);
exports.isElectronSandboxed = isElectronSandboxed;

const browserCodeLoadingCacheStrategy = (() => {
  var _nodeProcess3;

  // Always enabled when sandbox is enabled
  if (isElectronSandboxed) {
    return 'bypassHeatCheck';
  } // Otherwise, only enabled conditionally


  const env = (_nodeProcess3 = nodeProcess) === null || _nodeProcess3 === void 0 ? void 0 : _nodeProcess3.env['ENABLE_VSCODE_BROWSER_CODE_LOADING'];

  if (typeof env === 'string') {
    if (env === 'none' || env === 'code' || env === 'bypassHeatCheck' || env === 'bypassHeatCheckAndEagerCompile') {
      return env;
    }

    return 'bypassHeatCheck';
  }

  return undefined;
})();

exports.browserCodeLoadingCacheStrategy = browserCodeLoadingCacheStrategy;
const isPreferringBrowserCodeLoad = typeof browserCodeLoadingCacheStrategy === 'string';
exports.isPreferringBrowserCodeLoad = isPreferringBrowserCodeLoad;

// Web environment
if (typeof navigator === 'object' && !isElectronRenderer) {
  _userAgent = navigator.userAgent;
  _isWindows = _userAgent.indexOf('Windows') >= 0;
  _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
  _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
  _isLinux = _userAgent.indexOf('Linux') >= 0;
  _isWeb = true;
  _locale = navigator.language;
  _language = _locale;
} // Native environment
else if (typeof nodeProcess === 'object') {
    _isWindows = nodeProcess.platform === 'win32';
    _isMacintosh = nodeProcess.platform === 'darwin';
    _isLinux = nodeProcess.platform === 'linux';
    _isLinuxSnap = _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];

    if (rawNlsConfig) {
      try {
        const nlsConfig = JSON.parse(rawNlsConfig);
        const resolved = nlsConfig.availableLanguages['*'];
        _locale = nlsConfig.locale; // VSCode's default language is 'en'

        _language = resolved ? resolved : LANGUAGE_DEFAULT;
        _translationsConfigFile = nlsConfig._translationsConfigFile;
      } catch (e) {}
    }

    _isNative = true;
  } // Unknown environment
  else {
      console.error('Unable to resolve platform.');
    }

let Platform;
exports.Platform = Platform;

(function (Platform) {
  Platform[Platform["Web"] = 0] = "Web";
  Platform[Platform["Mac"] = 1] = "Mac";
  Platform[Platform["Linux"] = 2] = "Linux";
  Platform[Platform["Windows"] = 3] = "Windows";
})(Platform || (exports.Platform = Platform = {}));

function PlatformToString(platform) {
  switch (platform) {
    case Platform.Web:
      return 'Web';

    case Platform.Mac:
      return 'Mac';

    case Platform.Linux:
      return 'Linux';

    case Platform.Windows:
      return 'Windows';
  }
}

let _platform = Platform.Web;

if (_isMacintosh) {
  _platform = Platform.Mac;
} else if (_isWindows) {
  _platform = Platform.Windows;
} else if (_isLinux) {
  _platform = Platform.Linux;
}

const isWindows = _isWindows;
exports.isWindows = isWindows;
const isMacintosh = _isMacintosh;
exports.isMacintosh = isMacintosh;
const isLinux = _isLinux;
exports.isLinux = isLinux;
const isLinuxSnap = _isLinuxSnap;
exports.isLinuxSnap = isLinuxSnap;
const isNative = _isNative;
exports.isNative = isNative;
const isWeb = _isWeb;
exports.isWeb = isWeb;
const isIOS = _isIOS;
exports.isIOS = isIOS;
const platform = _platform;
exports.platform = platform;
const userAgent = _userAgent;
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */

exports.userAgent = userAgent;
const language = _language;
exports.language = language;
let Language;
/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */

exports.Language = Language;

(function (_Language) {
  function value() {
    return language;
  }

  _Language.value = value;

  function isDefaultVariant() {
    if (language.length === 2) {
      return language === 'en';
    } else if (language.length >= 3) {
      return language[0] === 'e' && language[1] === 'n' && language[2] === '-';
    } else {
      return false;
    }
  }

  _Language.isDefaultVariant = isDefaultVariant;

  function isDefault() {
    return language === 'en';
  }

  _Language.isDefault = isDefault;
})(Language || (exports.Language = Language = {}));

const locale = _locale;
/**
 * The translatios that are available through language packs.
 */

exports.locale = locale;
const translationsConfigFile = _translationsConfigFile;
exports.translationsConfigFile = translationsConfigFile;

const setImmediate = function defineSetImmediate() {
  var _nodeProcess4;

  if (globals.setImmediate) {
    return globals.setImmediate.bind(globals);
  }

  if (typeof globals.postMessage === 'function' && !globals.importScripts) {
    let pending = [];
    globals.addEventListener('message', e => {
      if (e.data && e.data.vscodeSetImmediateId) {
        for (let i = 0, len = pending.length; i < len; i++) {
          const candidate = pending[i];

          if (candidate.id === e.data.vscodeSetImmediateId) {
            pending.splice(i, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return callback => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback: callback
      });
      globals.postMessage({
        vscodeSetImmediateId: myId
      }, '*');
    };
  }

  if (typeof ((_nodeProcess4 = nodeProcess) === null || _nodeProcess4 === void 0 ? void 0 : _nodeProcess4.nextTick) === 'function') {
    return nodeProcess.nextTick.bind(nodeProcess);
  }

  const _promise = Promise.resolve();

  return callback => _promise.then(callback);
}();

exports.setImmediate = setImmediate;
let OperatingSystem;
exports.OperatingSystem = OperatingSystem;

(function (OperatingSystem) {
  OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
  OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
  OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
})(OperatingSystem || (exports.OperatingSystem = OperatingSystem = {}));

const OS = _isMacintosh || _isIOS ? OperatingSystem.Macintosh : _isWindows ? OperatingSystem.Windows : OperatingSystem.Linux;
exports.OS = OS;
let _isLittleEndian = true;
let _isLittleEndianComputed = false;

function isLittleEndian() {
  if (!_isLittleEndianComputed) {
    _isLittleEndianComputed = true;
    const test = new Uint8Array(2);
    test[0] = 1;
    test[1] = 2;
    const view = new Uint16Array(test.buffer);
    _isLittleEndian = view[0] === (2 << 8) + 1;
  }

  return _isLittleEndian;
}