"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOrSet = getOrSet;
exports.mapToString = mapToString;
exports.setToString = setToString;
exports.LRUCache = exports.LinkedMap = exports.Touch = exports.ResourceMap = exports.TernarySearchTree = exports.UriIterator = exports.PathIterator = exports.ConfigKeysIterator = exports.StringIterator = void 0;

function _react() {
  const data = _interopRequireDefault(require("react"));

  _react = function _react() {
    return data;
  };

  return data;
}

var _uri = require("./uri");

var _charCode = require("./charCode");

var _strings = require("./strings");

let _Symbol$iterator, _Symbol$toStringTag, _Symbol$iterator2, _Symbol$toStringTag2, _Symbol$iterator3;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function getOrSet(map, key, value) {
  let result = map.get(key);

  if (result === undefined) {
    result = value;
    map.set(key, result);
  }

  return result;
}

function mapToString(map) {
  const entries = [];
  map.forEach((value, key) => {
    entries.push(`${key} => ${value}`);
  });
  return `Map(${map.size}) {${entries.join(', ')}}`;
}

function setToString(set) {
  const entries = [];
  set.forEach(value => {
    entries.push(value);
  });
  return `Set(${set.size}) {${entries.join(', ')}}`;
}

class StringIterator {
  constructor() {
    this._value = '';
    this._pos = 0;
  }

  reset(key) {
    this._value = key;
    this._pos = 0;
    return this;
  }

  next() {
    this._pos += 1;
    return this;
  }

  hasNext() {
    return this._pos < this._value.length - 1;
  }

  cmp(a) {
    const aCode = a.charCodeAt(0);

    const thisCode = this._value.charCodeAt(this._pos);

    return aCode - thisCode;
  }

  value() {
    return this._value[this._pos];
  }

}

exports.StringIterator = StringIterator;

class ConfigKeysIterator {
  constructor(_caseSensitive = true) {
    this._caseSensitive = _caseSensitive;
    this._value = void 0;
    this._from = void 0;
    this._to = void 0;
  }

  reset(key) {
    this._value = key;
    this._from = 0;
    this._to = 0;
    return this.next();
  }

  hasNext() {
    return this._to < this._value.length;
  }

  next() {
    // this._data = key.split(/[\\/]/).filter(s => !!s);
    this._from = this._to;
    let justSeps = true;

    for (; this._to < this._value.length; this._to++) {
      const ch = this._value.charCodeAt(this._to);

      if (ch === _charCode.CharCode.Period) {
        if (justSeps) {
          this._from++;
        } else {
          break;
        }
      } else {
        justSeps = false;
      }
    }

    return this;
  }

  cmp(a) {
    return this._caseSensitive ? (0, _strings.compareSubstring)(a, this._value, 0, a.length, this._from, this._to) : (0, _strings.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
  }

  value() {
    return this._value.substring(this._from, this._to);
  }

}

exports.ConfigKeysIterator = ConfigKeysIterator;

class PathIterator {
  constructor(_splitOnBackslash = true, _caseSensitive = true) {
    this._splitOnBackslash = _splitOnBackslash;
    this._caseSensitive = _caseSensitive;
    this._value = void 0;
    this._from = void 0;
    this._to = void 0;
  }

  reset(key) {
    this._value = key.replace(/\\$|\/$/, '');
    this._from = 0;
    this._to = 0;
    return this.next();
  }

  hasNext() {
    return this._to < this._value.length;
  }

  next() {
    // this._data = key.split(/[\\/]/).filter(s => !!s);
    this._from = this._to;
    let justSeps = true;

    for (; this._to < this._value.length; this._to++) {
      const ch = this._value.charCodeAt(this._to);

      if (ch === _charCode.CharCode.Slash || this._splitOnBackslash && ch === _charCode.CharCode.Backslash) {
        if (justSeps) {
          this._from++;
        } else {
          break;
        }
      } else {
        justSeps = false;
      }
    }

    return this;
  }

  cmp(a) {
    return this._caseSensitive ? (0, _strings.compareSubstring)(a, this._value, 0, a.length, this._from, this._to) : (0, _strings.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
  }

  value() {
    return this._value.substring(this._from, this._to);
  }

}

exports.PathIterator = PathIterator;
var UriIteratorState;

(function (UriIteratorState) {
  UriIteratorState[UriIteratorState["Scheme"] = 1] = "Scheme";
  UriIteratorState[UriIteratorState["Authority"] = 2] = "Authority";
  UriIteratorState[UriIteratorState["Path"] = 3] = "Path";
  UriIteratorState[UriIteratorState["Query"] = 4] = "Query";
  UriIteratorState[UriIteratorState["Fragment"] = 5] = "Fragment";
})(UriIteratorState || (UriIteratorState = {}));

class UriIterator {
  constructor(_ignorePathCasing) {
    this._ignorePathCasing = _ignorePathCasing;
    this._pathIterator = void 0;
    this._value = void 0;
    this._states = [];
    this._stateIdx = 0;
  }

  reset(key) {
    this._value = key;
    this._states = [];

    if (this._value.scheme) {
      this._states.push(UriIteratorState.Scheme);
    }

    if (this._value.authority) {
      this._states.push(UriIteratorState.Authority);
    }

    if (this._value.path) {
      this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key));

      this._pathIterator.reset(key.path);

      if (this._pathIterator.value()) {
        this._states.push(UriIteratorState.Path);
      }
    }

    if (this._value.query) {
      this._states.push(UriIteratorState.Query);
    }

    if (this._value.fragment) {
      this._states.push(UriIteratorState.Fragment);
    }

    this._stateIdx = 0;
    return this;
  }

  next() {
    if (this._states[this._stateIdx] === UriIteratorState.Path && this._pathIterator.hasNext()) {
      this._pathIterator.next();
    } else {
      this._stateIdx += 1;
    }

    return this;
  }

  hasNext() {
    return this._states[this._stateIdx] === UriIteratorState.Path && this._pathIterator.hasNext() || this._stateIdx < this._states.length - 1;
  }

  cmp(a) {
    if (this._states[this._stateIdx] === UriIteratorState.Scheme) {
      return (0, _strings.compareIgnoreCase)(a, this._value.scheme);
    } else if (this._states[this._stateIdx] === UriIteratorState.Authority) {
      return (0, _strings.compareIgnoreCase)(a, this._value.authority);
    } else if (this._states[this._stateIdx] === UriIteratorState.Path) {
      return this._pathIterator.cmp(a);
    } else if (this._states[this._stateIdx] === UriIteratorState.Query) {
      return (0, _strings.compare)(a, this._value.query);
    } else if (this._states[this._stateIdx] === UriIteratorState.Fragment) {
      return (0, _strings.compare)(a, this._value.fragment);
    }

    throw new Error();
  }

  value() {
    if (this._states[this._stateIdx] === UriIteratorState.Scheme) {
      return this._value.scheme;
    } else if (this._states[this._stateIdx] === UriIteratorState.Authority) {
      return this._value.authority;
    } else if (this._states[this._stateIdx] === UriIteratorState.Path) {
      return this._pathIterator.value();
    } else if (this._states[this._stateIdx] === UriIteratorState.Query) {
      return this._value.query;
    } else if (this._states[this._stateIdx] === UriIteratorState.Fragment) {
      return this._value.fragment;
    }

    throw new Error();
  }

}

exports.UriIterator = UriIterator;

class TernarySearchTreeNode {
  constructor() {
    this.segment = void 0;
    this.value = void 0;
    this.key = void 0;
    this.left = void 0;
    this.mid = void 0;
    this.right = void 0;
  }

  isEmpty() {
    return !this.left && !this.mid && !this.right && !this.value;
  }

}

_Symbol$iterator = Symbol.iterator;

class TernarySearchTree {
  static forUris(ignorePathCasing = () => false) {
    return new TernarySearchTree(new UriIterator(ignorePathCasing));
  }

  static forPaths() {
    return new TernarySearchTree(new PathIterator());
  }

  static forStrings() {
    return new TernarySearchTree(new StringIterator());
  }

  static forConfigKeys() {
    return new TernarySearchTree(new ConfigKeysIterator());
  }

  constructor(segments) {
    this._iter = void 0;
    this._root = void 0;
    this._iter = segments;
  }

  clear() {
    this._root = undefined;
  }

  set(key, element) {
    const iter = this._iter.reset(key);

    let node;

    if (!this._root) {
      this._root = new TernarySearchTreeNode();
      this._root.segment = iter.value();
    }

    node = this._root;

    while (true) {
      const val = iter.cmp(node.segment);

      if (val > 0) {
        // left
        if (!node.left) {
          node.left = new TernarySearchTreeNode();
          node.left.segment = iter.value();
        }

        node = node.left;
      } else if (val < 0) {
        // right
        if (!node.right) {
          node.right = new TernarySearchTreeNode();
          node.right.segment = iter.value();
        }

        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();

        if (!node.mid) {
          node.mid = new TernarySearchTreeNode();
          node.mid.segment = iter.value();
        }

        node = node.mid;
      } else {
        break;
      }
    }

    const oldElement = node.value;
    node.value = element;
    node.key = key;
    return oldElement;
  }

  get(key) {
    var _this$_getNode;

    return (_this$_getNode = this._getNode(key)) === null || _this$_getNode === void 0 ? void 0 : _this$_getNode.value;
  }

  _getNode(key) {
    const iter = this._iter.reset(key);

    let node = this._root;

    while (node) {
      const val = iter.cmp(node.segment);

      if (val > 0) {
        // left
        node = node.left;
      } else if (val < 0) {
        // right
        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();
        node = node.mid;
      } else {
        break;
      }
    }

    return node;
  }

  has(key) {
    const node = this._getNode(key);

    return !((node === null || node === void 0 ? void 0 : node.value) === undefined && (node === null || node === void 0 ? void 0 : node.mid) === undefined);
  }

  delete(key) {
    return this._delete(key, false);
  }

  deleteSuperstr(key) {
    return this._delete(key, true);
  }

  _delete(key, superStr) {
    const iter = this._iter.reset(key);

    const stack = [];
    let node = this._root; // find and unset node

    while (node) {
      const val = iter.cmp(node.segment);

      if (val > 0) {
        // left
        stack.push([1, node]);
        node = node.left;
      } else if (val < 0) {
        // right
        stack.push([-1, node]);
        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();
        stack.push([0, node]);
        node = node.mid;
      } else {
        if (superStr) {
          // remove children
          node.left = undefined;
          node.mid = undefined;
          node.right = undefined;
        } else {
          // remove element
          node.value = undefined;
        } // clean up empty nodes


        while (stack.length > 0 && node.isEmpty()) {
          let _ref = stack.pop(),
              _ref2 = _slicedToArray(_ref, 2),
              dir = _ref2[0],
              parent = _ref2[1];

          switch (dir) {
            case 1:
              parent.left = undefined;
              break;

            case 0:
              parent.mid = undefined;
              break;

            case -1:
              parent.right = undefined;
              break;
          }

          node = parent;
        }

        break;
      }
    }
  }

  findSubstr(key) {
    const iter = this._iter.reset(key);

    let node = this._root;
    let candidate = undefined;

    while (node) {
      const val = iter.cmp(node.segment);

      if (val > 0) {
        // left
        node = node.left;
      } else if (val < 0) {
        // right
        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();
        candidate = node.value || candidate;
        node = node.mid;
      } else {
        break;
      }
    }

    return node && node.value || candidate;
  }

  findSuperstr(key) {
    const iter = this._iter.reset(key);

    let node = this._root;

    while (node) {
      const val = iter.cmp(node.segment);

      if (val > 0) {
        // left
        node = node.left;
      } else if (val < 0) {
        // right
        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();
        node = node.mid;
      } else {
        // collect
        if (!node.mid) {
          return undefined;
        } else {
          return this._entries(node.mid);
        }
      }
    }

    return undefined;
  }

  forEach(callback) {
    var _iterator = _createForOfIteratorHelper(this),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        const _step$value = _slicedToArray(_step.value, 2),
              key = _step$value[0],
              value = _step$value[1];

        callback(value, key);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  *[_Symbol$iterator]() {
    yield* this._entries(this._root);
  }

  *_entries(node) {
    if (node) {
      // left
      yield* this._entries(node.left); // node

      if (node.value) {
        // callback(node.value, this._iter.join(parts));
        yield [node.key, node.value];
      } // mid


      yield* this._entries(node.mid); // right

      yield* this._entries(node.right);
    }
  }

}

exports.TernarySearchTree = TernarySearchTree;
_Symbol$toStringTag = Symbol.toStringTag;
_Symbol$iterator2 = Symbol.iterator;

class ResourceMap {
  /**
   *
   * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
   */

  /**
   *
   * @param other Another resource which this maps is created from
   * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
   */
  constructor(mapOrKeyFn, toKey) {
    this[_Symbol$toStringTag] = 'ResourceMap';
    this.map = void 0;
    this.toKey = void 0;

    if (mapOrKeyFn instanceof ResourceMap) {
      this.map = new Map(mapOrKeyFn.map);
      this.toKey = toKey !== null && toKey !== void 0 ? toKey : ResourceMap.defaultToKey;
    } else {
      this.map = new Map();
      this.toKey = mapOrKeyFn !== null && mapOrKeyFn !== void 0 ? mapOrKeyFn : ResourceMap.defaultToKey;
    }
  }

  set(resource, value) {
    this.map.set(this.toKey(resource), value);
    return this;
  }

  get(resource) {
    return this.map.get(this.toKey(resource));
  }

  has(resource) {
    return this.map.has(this.toKey(resource));
  }

  get size() {
    return this.map.size;
  }

  clear() {
    this.map.clear();
  }

  delete(resource) {
    return this.map.delete(this.toKey(resource));
  }

  forEach(clb, thisArg) {
    if (typeof thisArg !== 'undefined') {
      clb = clb.bind(thisArg);
    }

    var _iterator2 = _createForOfIteratorHelper(this.map),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        let _step2$value = _slicedToArray(_step2.value, 2),
            index = _step2$value[0],
            value = _step2$value[1];

        clb(value, _uri.URI.parse(index), this);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }

  values() {
    return this.map.values();
  }

  *keys() {
    var _iterator3 = _createForOfIteratorHelper(this.map.keys()),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        let key = _step3.value;
        yield _uri.URI.parse(key);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }

  *entries() {
    var _iterator4 = _createForOfIteratorHelper(this.map.entries()),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        let tuple = _step4.value;
        yield [_uri.URI.parse(tuple[0]), tuple[1]];
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
  }

  *[_Symbol$iterator2]() {
    var _iterator5 = _createForOfIteratorHelper(this.map),
        _step5;

    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        let item = _step5.value;
        yield [_uri.URI.parse(item[0]), item[1]];
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
  }

}

exports.ResourceMap = ResourceMap;

ResourceMap.defaultToKey = resource => resource.toString();

let Touch;
exports.Touch = Touch;

(function (Touch) {
  Touch[Touch["None"] = 0] = "None";
  Touch[Touch["AsOld"] = 1] = "AsOld";
  Touch[Touch["AsNew"] = 2] = "AsNew";
})(Touch || (exports.Touch = Touch = {}));

_Symbol$toStringTag2 = Symbol.toStringTag;
_Symbol$iterator3 = Symbol.iterator;

class LinkedMap {
  constructor() {
    this[_Symbol$toStringTag2] = 'LinkedMap';
    this._map = void 0;
    this._head = void 0;
    this._tail = void 0;
    this._size = void 0;
    this._state = void 0;
    this._map = new Map();
    this._head = undefined;
    this._tail = undefined;
    this._size = 0;
    this._state = 0;
  }

  clear() {
    this._map.clear();

    this._head = undefined;
    this._tail = undefined;
    this._size = 0;
    this._state++;
  }

  isEmpty() {
    return !this._head && !this._tail;
  }

  get size() {
    return this._size;
  }

  get first() {
    var _this$_head;

    return (_this$_head = this._head) === null || _this$_head === void 0 ? void 0 : _this$_head.value;
  }

  get last() {
    var _this$_tail;

    return (_this$_tail = this._tail) === null || _this$_tail === void 0 ? void 0 : _this$_tail.value;
  }

  has(key) {
    return this._map.has(key);
  }

  get(key, touch = Touch.None) {
    const item = this._map.get(key);

    if (!item) {
      return undefined;
    }

    if (touch !== Touch.None) {
      this.touch(item, touch);
    }

    return item.value;
  }

  set(key, value, touch = Touch.None) {
    let item = this._map.get(key);

    if (item) {
      item.value = value;

      if (touch !== Touch.None) {
        this.touch(item, touch);
      }
    } else {
      item = {
        key,
        value,
        next: undefined,
        previous: undefined
      };

      switch (touch) {
        case Touch.None:
          this.addItemLast(item);
          break;

        case Touch.AsOld:
          this.addItemFirst(item);
          break;

        case Touch.AsNew:
          this.addItemLast(item);
          break;

        default:
          this.addItemLast(item);
          break;
      }

      this._map.set(key, item);

      this._size++;
    }

    return this;
  }

  delete(key) {
    return !!this.remove(key);
  }

  remove(key) {
    const item = this._map.get(key);

    if (!item) {
      return undefined;
    }

    this._map.delete(key);

    this.removeItem(item);
    this._size--;
    return item.value;
  }

  shift() {
    if (!this._head && !this._tail) {
      return undefined;
    }

    if (!this._head || !this._tail) {
      throw new Error('Invalid list');
    }

    const item = this._head;

    this._map.delete(item.key);

    this.removeItem(item);
    this._size--;
    return item.value;
  }

  forEach(callbackfn, thisArg) {
    const state = this._state;
    let current = this._head;

    while (current) {
      if (thisArg) {
        callbackfn.bind(thisArg)(current.value, current.key, this);
      } else {
        callbackfn(current.value, current.key, this);
      }

      if (this._state !== state) {
        throw new Error(`LinkedMap got modified during iteration.`);
      }

      current = current.next;
    }
  }

  keys() {
    const map = this;
    const state = this._state;
    let current = this._head;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      },

      next() {
        if (map._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }

        if (current) {
          const result = {
            value: current.key,
            done: false
          };
          current = current.next;
          return result;
        } else {
          return {
            value: undefined,
            done: true
          };
        }
      }

    };
    return iterator;
  }

  values() {
    const map = this;
    const state = this._state;
    let current = this._head;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      },

      next() {
        if (map._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }

        if (current) {
          const result = {
            value: current.value,
            done: false
          };
          current = current.next;
          return result;
        } else {
          return {
            value: undefined,
            done: true
          };
        }
      }

    };
    return iterator;
  }

  entries() {
    const map = this;
    const state = this._state;
    let current = this._head;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      },

      next() {
        if (map._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }

        if (current) {
          const result = {
            value: [current.key, current.value],
            done: false
          };
          current = current.next;
          return result;
        } else {
          return {
            value: undefined,
            done: true
          };
        }
      }

    };
    return iterator;
  }

  [_Symbol$iterator3]() {
    return this.entries();
  }

  trimOld(newSize) {
    if (newSize >= this.size) {
      return;
    }

    if (newSize === 0) {
      this.clear();
      return;
    }

    let current = this._head;
    let currentSize = this.size;

    while (current && currentSize > newSize) {
      this._map.delete(current.key);

      current = current.next;
      currentSize--;
    }

    this._head = current;
    this._size = currentSize;

    if (current) {
      current.previous = undefined;
    }

    this._state++;
  }

  addItemFirst(item) {
    // First time Insert
    if (!this._head && !this._tail) {
      this._tail = item;
    } else if (!this._head) {
      throw new Error('Invalid list');
    } else {
      item.next = this._head;
      this._head.previous = item;
    }

    this._head = item;
    this._state++;
  }

  addItemLast(item) {
    // First time Insert
    if (!this._head && !this._tail) {
      this._head = item;
    } else if (!this._tail) {
      throw new Error('Invalid list');
    } else {
      item.previous = this._tail;
      this._tail.next = item;
    }

    this._tail = item;
    this._state++;
  }

  removeItem(item) {
    if (item === this._head && item === this._tail) {
      this._head = undefined;
      this._tail = undefined;
    } else if (item === this._head) {
      // This can only happend if size === 1 which is handle
      // by the case above.
      if (!item.next) {
        throw new Error('Invalid list');
      }

      item.next.previous = undefined;
      this._head = item.next;
    } else if (item === this._tail) {
      // This can only happend if size === 1 which is handle
      // by the case above.
      if (!item.previous) {
        throw new Error('Invalid list');
      }

      item.previous.next = undefined;
      this._tail = item.previous;
    } else {
      const next = item.next;
      const previous = item.previous;

      if (!next || !previous) {
        throw new Error('Invalid list');
      }

      next.previous = previous;
      previous.next = next;
    }

    item.next = undefined;
    item.previous = undefined;
    this._state++;
  }

  touch(item, touch) {
    if (!this._head || !this._tail) {
      throw new Error('Invalid list');
    }

    if (touch !== Touch.AsOld && touch !== Touch.AsNew) {
      return;
    }

    if (touch === Touch.AsOld) {
      if (item === this._head) {
        return;
      }

      const next = item.next;
      const previous = item.previous; // Unlink the item

      if (item === this._tail) {
        // previous must be defined since item was not head but is tail
        // So there are more than on item in the map
        previous.next = undefined;
        this._tail = previous;
      } else {
        // Both next and previous are not undefined since item was neither head nor tail.
        next.previous = previous;
        previous.next = next;
      } // Insert the node at head


      item.previous = undefined;
      item.next = this._head;
      this._head.previous = item;
      this._head = item;
      this._state++;
    } else if (touch === Touch.AsNew) {
      if (item === this._tail) {
        return;
      }

      const next = item.next;
      const previous = item.previous; // Unlink the item.

      if (item === this._head) {
        // next must be defined since item was not tail but is head
        // So there are more than on item in the map
        next.previous = undefined;
        this._head = next;
      } else {
        // Both next and previous are not undefined since item was neither head nor tail.
        next.previous = previous;
        previous.next = next;
      }

      item.next = undefined;
      item.previous = this._tail;
      this._tail.next = item;
      this._tail = item;
      this._state++;
    }
  }

  toJSON() {
    const data = [];
    this.forEach((value, key) => {
      data.push([key, value]);
    });
    return data;
  }

  fromJSON(data) {
    this.clear();

    var _iterator6 = _createForOfIteratorHelper(data),
        _step6;

    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        const _step6$value = _slicedToArray(_step6.value, 2),
              key = _step6$value[0],
              value = _step6$value[1];

        this.set(key, value);
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
  }

}

exports.LinkedMap = LinkedMap;

class LRUCache extends LinkedMap {
  constructor(limit, ratio = 1) {
    super();
    this._limit = void 0;
    this._ratio = void 0;
    this._limit = limit;
    this._ratio = Math.min(Math.max(0, ratio), 1);
  }

  get limit() {
    return this._limit;
  }

  set limit(limit) {
    this._limit = limit;
    this.checkTrim();
  }

  get ratio() {
    return this._ratio;
  }

  set ratio(ratio) {
    this._ratio = Math.min(Math.max(0, ratio), 1);
    this.checkTrim();
  }

  get(key, touch = Touch.AsNew) {
    return super.get(key, touch);
  }

  peek(key) {
    return super.get(key, Touch.None);
  }

  set(key, value) {
    super.set(key, value, Touch.AsNew);
    this.checkTrim();
    return this;
  }

  checkTrim() {
    if (this.size > this._limit) {
      this.trimOld(Math.round(this._limit * this._ratio));
    }
  }

}

exports.LRUCache = LRUCache;