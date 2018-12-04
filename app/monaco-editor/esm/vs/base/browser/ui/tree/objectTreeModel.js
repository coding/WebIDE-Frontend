/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import { IndexTreeModel } from './indexTreeModel.js';
var ObjectTreeModel = /** @class */ (function () {
    function ObjectTreeModel(list, options) {
        if (options === void 0) { options = {}; }
        this.nodes = new Map();
        this.model = new IndexTreeModel(list, options);
        this.onDidChangeCollapseState = this.model.onDidChangeCollapseState;
        this.onDidChangeRenderNodeCount = this.model.onDidChangeRenderNodeCount;
    }
    ObjectTreeModel.prototype.getListIndex = function (element) {
        var location = this.getElementLocation(element);
        return this.model.getListIndex(location);
    };
    ObjectTreeModel.prototype.setCollapsed = function (element, collapsed) {
        var location = this.getElementLocation(element);
        return this.model.setCollapsed(location, collapsed);
    };
    ObjectTreeModel.prototype.toggleCollapsed = function (element) {
        var location = this.getElementLocation(element);
        this.model.toggleCollapsed(location);
    };
    ObjectTreeModel.prototype.getNodeLocation = function (node) {
        return node.element;
    };
    ObjectTreeModel.prototype.getParentNodeLocation = function (element) {
        var node = this.nodes.get(element);
        if (!node) {
            throw new Error("Tree element not found: " + element);
        }
        return node.parent.element;
    };
    ObjectTreeModel.prototype.getElementLocation = function (element) {
        if (element === null) {
            return [];
        }
        var node = this.nodes.get(element);
        if (!node) {
            throw new Error("Tree element not found: " + element);
        }
        return this.model.getNodeLocation(node);
    };
    return ObjectTreeModel;
}());
export { ObjectTreeModel };
