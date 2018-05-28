/* eslint-disable */
/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import URI from 'vscode-uri';
export function values(forEachable) {
  const result = [];
  forEachable.forEach(value => result.push(value));
  return result;
}
export function keys(map) {
  const result = [];
  map.forEach((value, key) => result.push(key));
  return result;
}
export function getOrSet(map, key, value) {
  let result = map.get(key);
  if (result === void 0) {
    result = value;
    map.set(key, result);
  }
  return result;
}
export class StringIterator {
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
  join(parts) {
    return parts.join('');
  }
  hasNext() {
    return this._pos < this._value.length - 1;
  }
  cmp(a) {
    let aCode = a.charCodeAt(0);
    let thisCode = this._value.charCodeAt(this._pos);
    return aCode - thisCode;
  }
  value() {
    return this._value[this._pos];
  }
}
export class PathIterator {
  reset(key) {
    this._value = key.replace(/\\$|\/$/, '');
    this._from = 0;
    this._to = 0;
    return this.next();
  }
  hasNext() {
    return this._to < this._value.length;
  }
  join(parts) {
    return parts.join('/');
  }
  next() {
    // this._data = key.split(/[\\/]/).filter(s => !!s);
    this._from = this._to;
    let justSeps = true;
    for (; this._to < this._value.length; this._to++) {
      const ch = this._value.charCodeAt(this._to);
      if (ch === PathIterator._fwd || ch === PathIterator._bwd) {
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
    let aPos = 0;
    let aLen = a.length;
    let thisPos = this._from;
    while (aPos < aLen && thisPos < this._to) {
      let cmp = a.charCodeAt(aPos) - this._value.charCodeAt(thisPos);
      if (cmp !== 0) {
        return cmp;
      }
      aPos += 1;
      thisPos += 1;
    }
    if (aLen === this._to - this._from) {
      return 0;
    } else if (aPos < aLen) {
      return -1;
    } else {
      return 1;
    }
  }
  value() {
    return this._value.substring(this._from, this._to);
  }
}
PathIterator._fwd = '/'.charCodeAt(0);
PathIterator._bwd = '\\'.charCodeAt(0);
class TernarySearchTreeNode {
  isEmpty() {
    return !this.left && !this.mid && !this.right && !this.element;
  }
}
export class TernarySearchTree {
  constructor(segments) {
    this._iter = segments;
  }
  static forPaths() {
    return new TernarySearchTree(new PathIterator());
  }
  static forStrings() {
    return new TernarySearchTree(new StringIterator());
  }
  clear() {
    this._root = undefined;
  }
  set(key, element) {
    let iter = this._iter.reset(key);
    let node;
    if (!this._root) {
      this._root = new TernarySearchTreeNode();
      this._root.str = iter.value();
    }
    node = this._root;
    while (true) {
      let val = iter.cmp(node.str);
      if (val > 0) {
        // left
        if (!node.left) {
          node.left = new TernarySearchTreeNode();
          node.left.str = iter.value();
        }
        node = node.left;
      } else if (val < 0) {
        // right
        if (!node.right) {
          node.right = new TernarySearchTreeNode();
          node.right.str = iter.value();
        }
        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();
        if (!node.mid) {
          node.mid = new TernarySearchTreeNode();
          node.mid.str = iter.value();
        }
        node = node.mid;
      } else {
        break;
      }
    }
    const oldElement = node.element;
    node.element = element;
    return oldElement;
  }
  get(key) {
    let iter = this._iter.reset(key);
    let node = this._root;
    while (node) {
      let val = iter.cmp(node.str);
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
    return node ? node.element : undefined;
  }
  delete(key) {
    let iter = this._iter.reset(key);
    let stack = [];
    let node = this._root;
    // find and unset node
    while (node) {
      let val = iter.cmp(node.str);
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
        // remove element
        node.element = undefined;
        // clean up empty nodes
        while (stack.length > 0 && node.isEmpty()) {
          let [dir, parent] = stack.pop();
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
    let iter = this._iter.reset(key);
    let node = this._root;
    let candidate;
    while (node) {
      let val = iter.cmp(node.str);
      if (val > 0) {
        // left
        node = node.left;
      } else if (val < 0) {
        // right
        node = node.right;
      } else if (iter.hasNext()) {
        // mid
        iter.next();
        candidate = node.element || candidate;
        node = node.mid;
      } else {
        break;
      }
    }
    return node && node.element || candidate;
  }
  findSuperstr(key) {
    let iter = this._iter.reset(key);
    let node = this._root;
    while (node) {
      let val = iter.cmp(node.str);
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
        }
        let ret = new TernarySearchTree(this._iter);
        ret._root = node.mid;
        return ret;
      }
    }
    return undefined;
  }
  forEach(callback) {
    this._forEach(this._root, [], callback);
  }
  _forEach(node, parts, callback) {
    if (node) {
      // left
      this._forEach(node.left, parts, callback);
      // node
      parts.push(node.str);
      if (node.element) {
        callback(node.element, this._iter.join(parts));
      }
      // mid
      this._forEach(node.mid, parts, callback);
      parts.pop();
      // right
      this._forEach(node.right, parts, callback);
    }
  }
}
export class ResourceMap {
  constructor() {
    this.map = new Map();
    this.ignoreCase = false; // in the future this should be an uri-comparator
  }
  set(resource, value) {
    this.map.set(this.toKey(resource), value);
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
  forEach(clb) {
    this.map.forEach(clb);
  }
  values() {
    return values(this.map);
  }
  toKey(resource) {
    let key = resource.toString();
    if (this.ignoreCase) {
      key = key.toLowerCase();
    }
    return key;
  }
  keys() {
    return keys(this.map).map(URI.parse);
  }
}
export var Touch;
(function (Touch) {
  Touch[Touch["None"] = 0] = "None";
  Touch[Touch["AsOld"] = 1] = "AsOld";
  Touch[Touch["AsNew"] = 2] = "AsNew";
})(Touch || (Touch = {}));
export class LinkedMap {
  constructor() {
    this._map = new Map();
    this._head = undefined;
    this._tail = undefined;
    this._size = 0;
  }
  clear() {
    this._map.clear();
    this._head = undefined;
    this._tail = undefined;
    this._size = 0;
  }
  isEmpty() {
    return !this._head && !this._tail;
  }
  get size() {
    return this._size;
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
    let current = this._head;
    while (current) {
      if (thisArg) {
        callbackfn.bind(thisArg)(current.value, current.key, this);
      } else {
        callbackfn(current.value, current.key, this);
      }
      current = current.next;
    }
  }
  values() {
    let result = [];
    let current = this._head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
  keys() {
    let result = [];
    let current = this._head;
    while (current) {
      result.push(current.key);
      current = current.next;
    }
    return result;
  }
  /* VS Code / Monaco editor runs on es5 which has no Symbol.iterator
  public keys(): IterableIterator<K> {
      let current = this._head;
      let iterator: IterableIterator<K> = {
          [Symbol.iterator]() {
              return iterator;
          },
          next():IteratorResult<K> {
              if (current) {
                  let result = { value: current.key, done: false };
                  current = current.next;
                  return result;
              } else {
                  return { value: undefined, done: true };
              }
          }
      };
      return iterator;
  }

  public values(): IterableIterator<V> {
      let current = this._head;
      let iterator: IterableIterator<V> = {
          [Symbol.iterator]() {
              return iterator;
          },
          next():IteratorResult<V> {
              if (current) {
                  let result = { value: current.value, done: false };
                  current = current.next;
                  return result;
              } else {
                  return { value: undefined, done: true };
              }
          }
      };
      return iterator;
  }
  */
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
    current.previous = void 0;
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
  }
  removeItem(item) {
    if (item === this._head && item === this._tail) {
      this._head = void 0;
      this._tail = void 0;
    } else if (item === this._head) {
      this._head = item.next;
    } else if (item === this._tail) {
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
  }
  touch(item, touch) {
    if (!this._head || !this._tail) {
      throw new Error('Invalid list');
    }
    if ((touch !== Touch.AsOld && touch !== Touch.AsNew)) {
      return;
    }
    if (touch === Touch.AsOld) {
      if (item === this._head) {
        return;
      }
      const next = item.next;
      const previous = item.previous;
      // Unlink the item
      if (item === this._tail) {
        // previous must be defined since item was not head but is tail
        // So there are more than on item in the map
        previous.next = void 0;
        this._tail = previous;
      } else {
        // Both next and previous are not undefined since item was neither head nor tail.
        next.previous = previous;
        previous.next = next;
      }
      // Insert the node at head
      item.previous = void 0;
      item.next = this._head;
      this._head.previous = item;
      this._head = item;
    } else if (touch === Touch.AsNew) {
      if (item === this._tail) {
        return;
      }
      const next = item.next;
      const previous = item.previous;
      // Unlink the item.
      if (item === this._head) {
        // next must be defined since item was not tail but is head
        // So there are more than on item in the map
        next.previous = void 0;
        this._head = next;
      } else {
        // Both next and previous are not undefined since item was neither head nor tail.
        next.previous = previous;
        previous.next = next;
      }
      item.next = void 0;
      item.previous = this._tail;
      this._tail.next = item;
      this._tail = item;
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
    for (const [key, value] of data) {
      this.set(key, value);
    }
  }
}
export class LRUCache extends LinkedMap {
  constructor(limit, ratio = 1) {
    super();
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
  get(key) {
    return super.get(key, Touch.AsNew);
  }
  peek(key) {
    return super.get(key, Touch.None);
  }
  set(key, value) {
    super.set(key, value, Touch.AsNew);
    this.checkTrim();
  }
  checkTrim() {
    if (this.size > this._limit) {
      this.trimOld(Math.round(this._limit * this._ratio));
    }
  }
}
