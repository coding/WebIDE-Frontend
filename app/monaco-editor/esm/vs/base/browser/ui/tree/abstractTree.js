/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import './media/tree.css';
import { dispose } from '../../../common/lifecycle.js';
import { List } from '../list/listWidget.js';
import { append, $, toggleClass } from '../../dom.js';
import { Relay, chain } from '../../../common/event.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
export function createComposedTreeListOptions(options) {
    if (!options) {
        return undefined;
    }
    var identityProvider = undefined;
    if (options.identityProvider) {
        identityProvider = function (el) { return options.identityProvider(el.element); };
    }
    var multipleSelectionController = undefined;
    if (options.multipleSelectionController) {
        multipleSelectionController = {
            isSelectionSingleChangeEvent: function (e) {
                return options.multipleSelectionController.isSelectionSingleChangeEvent(__assign({}, e, { element: e.element }));
            },
            isSelectionRangeChangeEvent: function (e) {
                return options.multipleSelectionController.isSelectionRangeChangeEvent(__assign({}, e, { element: e.element }));
            }
        };
    }
    var accessibilityProvider = undefined;
    if (options.accessibilityProvider) {
        accessibilityProvider = {
            getAriaLabel: function (e) {
                return options.accessibilityProvider.getAriaLabel(e.element);
            }
        };
    }
    return __assign({}, options, { identityProvider: identityProvider,
        multipleSelectionController: multipleSelectionController,
        accessibilityProvider: accessibilityProvider });
}
var ComposedTreeDelegate = /** @class */ (function () {
    function ComposedTreeDelegate(delegate) {
        this.delegate = delegate;
    }
    ComposedTreeDelegate.prototype.getHeight = function (element) {
        return this.delegate.getHeight(element.element);
    };
    ComposedTreeDelegate.prototype.getTemplateId = function (element) {
        return this.delegate.getTemplateId(element.element);
    };
    return ComposedTreeDelegate;
}());
export { ComposedTreeDelegate };
var TreeRenderer = /** @class */ (function () {
    function TreeRenderer(renderer, onDidChangeCollapseState) {
        this.renderer = renderer;
        this.renderedElements = new Map();
        this.renderedNodes = new Map();
        this.disposables = [];
        this.templateId = renderer.templateId;
        onDidChangeCollapseState(this.onDidChangeNodeTwistieState, this, this.disposables);
        if (renderer.onDidChangeTwistieState) {
            renderer.onDidChangeTwistieState(this.onDidChangeTwistieState, this, this.disposables);
        }
    }
    TreeRenderer.prototype.renderTemplate = function (container) {
        var el = append(container, $('.monaco-tl-row'));
        var twistie = append(el, $('.monaco-tl-twistie'));
        var contents = append(el, $('.monaco-tl-contents'));
        var templateData = this.renderer.renderTemplate(contents);
        return { twistie: twistie, templateData: templateData };
    };
    TreeRenderer.prototype.renderElement = function (node, index, templateData) {
        this.renderedNodes.set(node, templateData);
        this.renderedElements.set(node.element, node);
        templateData.twistie.style.width = 10 + node.depth * 10 + "px";
        this.renderTwistie(node, templateData.twistie);
        this.renderer.renderElement(node, index, templateData.templateData);
    };
    TreeRenderer.prototype.disposeElement = function (node, index, templateData) {
        this.renderer.disposeElement(node, index, templateData.templateData);
        this.renderedNodes.delete(node);
        this.renderedElements.set(node.element);
    };
    TreeRenderer.prototype.disposeTemplate = function (templateData) {
        this.renderer.disposeTemplate(templateData.templateData);
    };
    TreeRenderer.prototype.onDidChangeTwistieState = function (element) {
        var node = this.renderedElements.get(element);
        if (!node) {
            return;
        }
        this.onDidChangeNodeTwistieState(node);
    };
    TreeRenderer.prototype.onDidChangeNodeTwistieState = function (node) {
        var templateData = this.renderedNodes.get(node);
        if (!templateData) {
            return;
        }
        this.renderTwistie(node, templateData.twistie);
    };
    TreeRenderer.prototype.renderTwistie = function (node, twistieElement) {
        if (this.renderer.renderTwistie && this.renderer.renderTwistie(node.element, twistieElement)) {
            return;
        }
        TreeRenderer.renderDefaultTwistie(node, twistieElement);
    };
    TreeRenderer.renderDefaultTwistie = function (node, twistie) {
        toggleClass(twistie, 'collapsible', node.collapsible);
        toggleClass(twistie, 'collapsed', node.collapsed);
    };
    TreeRenderer.prototype.dispose = function () {
        this.renderedNodes.clear();
        this.renderedElements.clear();
        this.disposables = dispose(this.disposables);
    };
    return TreeRenderer;
}());
function isInputElement(e) {
    return e.tagName === 'INPUT' || e.tagName === 'TEXTAREA';
}
var AbstractTree = /** @class */ (function () {
    function AbstractTree(container, delegate, renderers, options) {
        var _a;
        this.disposables = [];
        var treeDelegate = new ComposedTreeDelegate(delegate);
        var onDidChangeCollapseStateRelay = new Relay();
        var treeRenderers = renderers.map(function (r) { return new TreeRenderer(r, onDidChangeCollapseStateRelay.event); });
        (_a = this.disposables).push.apply(_a, treeRenderers);
        this.view = new List(container, treeDelegate, treeRenderers, createComposedTreeListOptions(options));
        this.onDidChangeFocus = this.view.onFocusChange;
        this.onDidChangeSelection = this.view.onSelectionChange;
        this.onContextMenu = this.view.onContextMenu;
        this.model = this.createModel(this.view, options);
        onDidChangeCollapseStateRelay.input = this.model.onDidChangeCollapseState;
        this.onDidChangeCollapseState = this.model.onDidChangeCollapseState;
        this.onDidChangeRenderNodeCount = this.model.onDidChangeRenderNodeCount;
        if (options.mouseSupport !== false) {
            this.view.onMouseClick(this.onMouseClick, this, this.disposables);
        }
        if (options.keyboardSupport !== false) {
            var onKeyDown = chain(this.view.onKeyDown)
                .filter(function (e) { return !isInputElement(e.target); })
                .map(function (e) { return new StandardKeyboardEvent(e); });
            onKeyDown.filter(function (e) { return e.keyCode === 15 /* LeftArrow */; }).on(this.onLeftArrow, this, this.disposables);
            onKeyDown.filter(function (e) { return e.keyCode === 17 /* RightArrow */; }).on(this.onRightArrow, this, this.disposables);
            onKeyDown.filter(function (e) { return e.keyCode === 10 /* Space */; }).on(this.onSpace, this, this.disposables);
        }
    }
    Object.defineProperty(AbstractTree.prototype, "onDidFocus", {
        get: function () { return this.view.onDidFocus; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AbstractTree.prototype, "onDidDispose", {
        get: function () { return this.view.onDidDispose; },
        enumerable: true,
        configurable: true
    });
    // Widget
    AbstractTree.prototype.getHTMLElement = function () {
        return this.view.getHTMLElement();
    };
    AbstractTree.prototype.getFocus = function () {
        var nodes = this.view.getFocusedElements();
        return nodes.map(function (n) { return n.element; });
    };
    AbstractTree.prototype.onMouseClick = function (e) {
        var node = e.element;
        var location = this.model.getNodeLocation(node);
        this.model.toggleCollapsed(location);
    };
    AbstractTree.prototype.onLeftArrow = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var nodes = this.view.getFocusedElements();
        if (nodes.length === 0) {
            return;
        }
        var node = nodes[0];
        var location = this.model.getNodeLocation(node);
        var didChange = this.model.setCollapsed(location, true);
        if (!didChange) {
            var parentLocation = this.model.getParentNodeLocation(location);
            if (parentLocation === null) {
                return;
            }
            var parentListIndex = this.model.getListIndex(parentLocation);
            this.view.reveal(parentListIndex);
            this.view.setFocus([parentListIndex]);
        }
    };
    AbstractTree.prototype.onRightArrow = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var nodes = this.view.getFocusedElements();
        if (nodes.length === 0) {
            return;
        }
        var node = nodes[0];
        var location = this.model.getNodeLocation(node);
        var didChange = this.model.setCollapsed(location, false);
        if (!didChange) {
            if (node.children.length === 0) {
                return;
            }
            var focusedIndex = this.view.getFocus()[0];
            var firstChildIndex = focusedIndex + 1;
            this.view.reveal(firstChildIndex);
            this.view.setFocus([firstChildIndex]);
        }
    };
    AbstractTree.prototype.onSpace = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var nodes = this.view.getFocusedElements();
        if (nodes.length === 0) {
            return;
        }
        var node = nodes[0];
        var location = this.model.getNodeLocation(node);
        this.model.toggleCollapsed(location);
    };
    AbstractTree.prototype.dispose = function () {
        this.disposables = dispose(this.disposables);
        this.view.dispose();
        this.view = null;
        this.model = null;
    };
    return AbstractTree;
}());
export { AbstractTree };
