"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextTick = exports.platform = exports.env = exports.cwd = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _platform = require("./platform");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let safeProcess; // Native node.js environment

if (typeof process !== 'undefined') {
  safeProcess = {
    get platform() {
      return process.platform;
    },

    get env() {
      return process.env;
    },

    cwd() {
      return process.env['VSCODE_CWD'] || process.cwd();
    },

    nextTick(callback) {
      return process.nextTick(callback);
    }

  };
} // Native sandbox environment
else if (typeof _platform.globals.vscode !== 'undefined') {
    const sandboxProcess = _platform.globals.vscode.process;
    safeProcess = {
      get platform() {
        return sandboxProcess.platform;
      },

      get env() {
        return sandboxProcess.env;
      },

      cwd() {
        return sandboxProcess.cwd();
      },

      nextTick(callback) {
        return (0, _platform.setImmediate)(callback);
      }

    };
  } // Web environment
  else {
      safeProcess = {
        // Supported
        get platform() {
          return _platform.isWindows ? 'win32' : _platform.isMacintosh ? 'darwin' : 'linux';
        },

        nextTick(callback) {
          return (0, _platform.setImmediate)(callback);
        },

        // Unsupported
        get env() {
          return Object.create(null);
        },

        cwd() {
          return '/';
        }

      };
    }
/**
 * Provides safe access to the `cwd` property in node.js, sandboxed or web
 * environments.
 *
 * Note: in web, this property is hardcoded to be `/`.
 */


const cwd = safeProcess.cwd;
/**
 * Provides safe access to the `env` property in node.js, sandboxed or web
 * environments.
 *
 * Note: in web, this property is hardcoded to be `{}`.
 */

exports.cwd = cwd;
const env = safeProcess.env;
/**
 * Provides safe access to the `platform` property in node.js, sandboxed or web
 * environments.
 */

exports.env = env;
const platform = safeProcess.platform;
/**
 * Provides safe access to the `nextTick` method in node.js, sandboxed or web
 * environments.
 */

exports.platform = platform;
const nextTick = safeProcess.nextTick;
exports.nextTick = nextTick;