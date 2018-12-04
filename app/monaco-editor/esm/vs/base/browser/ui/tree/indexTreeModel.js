/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter, EventBufferer } from '../../../common/event.js';
import { tail2 } from '../../../common/arrays.js';
var IndexTreeModel = /** @class */ (function () {
    function IndexTreeModel(list, options) {
        if (options === void 0) { options = {}; }
        this.list = list;
        this.root = {
            parent: undefined,
            element: undefined,
            children: [],
            depth: 0,
            collapsible: false,
            collapsed: false,
            renderNodeCount: 0,
            visible: true,
            filterData: undefined
        };
        this.eventBufferer = new EventBufferer();
        this._onDidChangeCollapseState = new Emitter();
        this.onDidChangeCollapseState = this.eventBufferer.wrapEvent(this._onDidChangeCollapseState.event);
        this._onDidChangeRenderNodeCount = new Emitter();
        this.onDidChangeRenderNodeCount = this.eventBufferer.wrapEvent(this._onDidChangeRenderNodeCount.event);
        this.filter = options.filter;
    }
    IndexTreeModel.prototype.getListIndex = function (location) {
        return this.getTreeNodeWithListIndex(location).listIndex;
    };
    IndexTreeModel.prototype.setCollapsed = function (location, collapsed) {
        var _this = this;
        var _a = this.getTreeNodeWithListIndex(location), node = _a.node, listIndex = _a.listIndex, revealed = _a.revealed;
        return this.eventBufferer.bufferEvents(function () { return _this._setCollapsed(node, listIndex, revealed, collapsed); });
    };
    IndexTreeModel.prototype.toggleCollapsed = function (location) {
        var _this = this;
        var _a = this.getTreeNodeWithListIndex(location), node = _a.node, listIndex = _a.listIndex, revealed = _a.revealed;
        this.eventBufferer.bufferEvents(function () { return _this._setCollapsed(node, listIndex, revealed); });
    };
    IndexTreeModel.prototype._setCollapsed = function (node, listIndex, revealed, collapsed) {
        if (!node.collapsible) {
            return false;
        }
        if (typeof collapsed === 'undefined') {
            collapsed = !node.collapsed;
        }
        if (node.collapsed === collapsed) {
            return false;
        }
        node.collapsed = collapsed;
        if (revealed) {
            var previousRenderNodeCount = node.renderNodeCount;
            var toInsert = this.updateNodeAfterCollapseChange(node);
            this.list.splice(listIndex + 1, previousRenderNodeCount - 1, toInsert.slice(1));
            this._onDidChangeCollapseState.fire(node);
        }
        return true;
    };
    IndexTreeModel.prototype.updateNodeAfterCollapseChange = function (node) {
        var previousRenderNodeCount = node.renderNodeCount;
        var result = [];
        this._updateNodeAfterCollapseChange(node, result);
        this._updateAncestorsRenderNodeCount(node.parent, result.length - previousRenderNodeCount);
        return result;
    };
    IndexTreeModel.prototype._updateNodeAfterCollapseChange = function (node, result) {
        if (node.visible === false) {
            return 0;
        }
        result.push(node);
        node.renderNodeCount = 1;
        if (!node.collapsed) {
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                node.renderNodeCount += this._updateNodeAfterCollapseChange(child, result);
            }
        }
        this._onDidChangeRenderNodeCount.fire(node);
        return node.renderNodeCount;
    };
    IndexTreeModel.prototype._updateAncestorsRenderNodeCount = function (node, diff) {
        if (diff === 0) {
            return;
        }
        while (node) {
            node.renderNodeCount += diff;
            this._onDidChangeRenderNodeCount.fire(node);
            node = node.parent;
        }
    };
    // expensive
    IndexTreeModel.prototype.getTreeNodeWithListIndex = function (location) {
        var _a = this.getParentNodeWithListIndex(location), parentNode = _a.parentNode, listIndex = _a.listIndex, revealed = _a.revealed;
        var index = location[location.length - 1];
        if (index < 0 || index > parentNode.children.length) {
            throw new Error('Invalid tree location');
        }
        var node = parentNode.children[index];
        return { node: node, listIndex: listIndex, revealed: revealed };
    };
    IndexTreeModel.prototype.getParentNodeWithListIndex = function (location, node, listIndex, revealed) {
        if (node === void 0) { node = this.root; }
        if (listIndex === void 0) { listIndex = 0; }
        if (revealed === void 0) { revealed = true; }
        var index = location[0], rest = location.slice(1);
        if (index < 0 || index > node.children.length) {
            throw new Error('Invalid tree location');
        }
        // TODO@joao perf!
        for (var i = 0; i < index; i++) {
            listIndex += node.children[i].renderNodeCount;
        }
        revealed = revealed && !node.collapsed;
        if (rest.length === 0) {
            return { parentNode: node, listIndex: listIndex, revealed: revealed };
        }
        return this.getParentNodeWithListIndex(rest, node.children[index], listIndex + 1, revealed);
    };
    // TODO@joao perf!
    IndexTreeModel.prototype.getNodeLocation = function (node) {
        var location = [];
        while (node.parent) {
            location.push(node.parent.children.indexOf(node));
            node = node.parent;
        }
        return location.reverse();
    };
    IndexTreeModel.prototype.getParentNodeLocation = function (location) {
        if (location.length <= 1) {
            return [];
        }
        return tail2(location)[0];
    };
    return IndexTreeModel;
}());
export { IndexTreeModel };
