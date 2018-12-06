/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
export class ParsedThemeRule {
    constructor(scope, parentScopes, index, fontStyle, foreground, background) {
        this.scope = scope;
        this.parentScopes = parentScopes;
        this.index = index;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
}
function isValidHexColor(hex) {
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
        // #rrggbb
        return true;
    }
    if (/^#[0-9a-f]{8}$/i.test(hex)) {
        // #rrggbbaa
        return true;
    }
    if (/^#[0-9a-f]{3}$/i.test(hex)) {
        // #rgb
        return true;
    }
    if (/^#[0-9a-f]{4}$/i.test(hex)) {
        // #rgba
        return true;
    }
    return false;
}
/**
 * Parse a raw theme into rules.
 */
export function parseTheme(source) {
    if (!source) {
        return [];
    }
    if (!source.settings || !Array.isArray(source.settings)) {
        return [];
    }
    let settings = source.settings;
    let result = [], resultLen = 0;
    for (let i = 0, len = settings.length; i < len; i++) {
        let entry = settings[i];
        if (!entry.settings) {
            continue;
        }
        let scopes;
        if (typeof entry.scope === 'string') {
            let _scope = entry.scope;
            // remove leading commas
            _scope = _scope.replace(/^[,]+/, '');
            // remove trailing commans
            _scope = _scope.replace(/[,]+$/, '');
            scopes = _scope.split(',');
        }
        else if (Array.isArray(entry.scope)) {
            scopes = entry.scope;
        }
        else {
            scopes = [''];
        }
        let fontStyle = -1 /* NotSet */;
        if (typeof entry.settings.fontStyle === 'string') {
            fontStyle = 0 /* None */;
            let segments = entry.settings.fontStyle.split(' ');
            for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                let segment = segments[j];
                switch (segment) {
                    case 'italic':
                        fontStyle = fontStyle | 1 /* Italic */;
                        break;
                    case 'bold':
                        fontStyle = fontStyle | 2 /* Bold */;
                        break;
                    case 'underline':
                        fontStyle = fontStyle | 4 /* Underline */;
                        break;
                }
            }
        }
        let foreground = null;
        if (typeof entry.settings.foreground === 'string' && isValidHexColor(entry.settings.foreground)) {
            foreground = entry.settings.foreground;
        }
        let background = null;
        if (typeof entry.settings.background === 'string' && isValidHexColor(entry.settings.background)) {
            background = entry.settings.background;
        }
        for (let j = 0, lenJ = scopes.length; j < lenJ; j++) {
            let _scope = scopes[j].trim();
            let segments = _scope.split(' ');
            let scope = segments[segments.length - 1];
            let parentScopes = null;
            if (segments.length > 1) {
                parentScopes = segments.slice(0, segments.length - 1);
                parentScopes.reverse();
            }
            result[resultLen++] = new ParsedThemeRule(scope, parentScopes, i, fontStyle, foreground, background);
        }
    }
    return result;
}
/**
 * Resolve rules (i.e. inheritance).
 */
function resolveParsedThemeRules(parsedThemeRules) {
    // Sort rules lexicographically, and then by index if necessary
    parsedThemeRules.sort((a, b) => {
        let r = strcmp(a.scope, b.scope);
        if (r !== 0) {
            return r;
        }
        r = strArrCmp(a.parentScopes, b.parentScopes);
        if (r !== 0) {
            return r;
        }
        return a.index - b.index;
    });
    // Determine defaults
    let defaultFontStyle = 0 /* None */;
    let defaultForeground = '#000000';
    let defaultBackground = '#ffffff';
    while (parsedThemeRules.length >= 1 && parsedThemeRules[0].scope === '') {
        let incomingDefaults = parsedThemeRules.shift();
        if (incomingDefaults.fontStyle !== -1 /* NotSet */) {
            defaultFontStyle = incomingDefaults.fontStyle;
        }
        if (incomingDefaults.foreground !== null) {
            defaultForeground = incomingDefaults.foreground;
        }
        if (incomingDefaults.background !== null) {
            defaultBackground = incomingDefaults.background;
        }
    }
    let colorMap = new ColorMap();
    let defaults = new ThemeTrieElementRule(0, null, defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
    let root = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1 /* NotSet */, 0, 0), []);
    for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
        let rule = parsedThemeRules[i];
        root.insert(0, rule.scope, rule.parentScopes, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
    }
    return new Theme(colorMap, defaults, root);
}
export class ColorMap {
    constructor() {
        this._lastColorId = 0;
        this._id2color = [];
        this._color2id = Object.create(null);
    }
    getId(color) {
        if (color === null) {
            return 0;
        }
        color = color.toUpperCase();
        let value = this._color2id[color];
        if (value) {
            return value;
        }
        value = ++this._lastColorId;
        this._color2id[color] = value;
        this._id2color[value] = color;
        return value;
    }
    getColorMap() {
        return this._id2color.slice(0);
    }
}
export class Theme {
    static createFromRawTheme(source) {
        return this.createFromParsedTheme(parseTheme(source));
    }
    static createFromParsedTheme(source) {
        return resolveParsedThemeRules(source);
    }
    constructor(colorMap, defaults, root) {
        this._colorMap = colorMap;
        this._root = root;
        this._defaults = defaults;
        this._cache = {};
    }
    getColorMap() {
        return this._colorMap.getColorMap();
    }
    getDefaults() {
        return this._defaults;
    }
    match(scopeName) {
        if (!this._cache.hasOwnProperty(scopeName)) {
            this._cache[scopeName] = this._root.match(scopeName);
        }
        return this._cache[scopeName];
    }
}
export function strcmp(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
export function strArrCmp(a, b) {
    if (a === null && b === null) {
        return 0;
    }
    if (!a) {
        return -1;
    }
    if (!b) {
        return 1;
    }
    let len1 = a.length;
    let len2 = b.length;
    if (len1 === len2) {
        for (let i = 0; i < len1; i++) {
            let res = strcmp(a[i], b[i]);
            if (res !== 0) {
                return res;
            }
        }
        return 0;
    }
    return len1 - len2;
}
export class ThemeTrieElementRule {
    constructor(scopeDepth, parentScopes, fontStyle, foreground, background) {
        this.scopeDepth = scopeDepth;
        this.parentScopes = parentScopes;
        this.fontStyle = fontStyle;
        this.foreground = foreground;
        this.background = background;
    }
    clone() {
        return new ThemeTrieElementRule(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
    }
    static cloneArr(arr) {
        let r = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            r[i] = arr[i].clone();
        }
        return r;
    }
    acceptOverwrite(scopeDepth, fontStyle, foreground, background) {
        if (this.scopeDepth > scopeDepth) {
            console.log('how did this happen?');
        }
        else {
            this.scopeDepth = scopeDepth;
        }
        // console.log('TODO -> my depth: ' + this.scopeDepth + ', overwriting depth: ' + scopeDepth);
        if (fontStyle !== -1 /* NotSet */) {
            this.fontStyle = fontStyle;
        }
        if (foreground !== 0) {
            this.foreground = foreground;
        }
        if (background !== 0) {
            this.background = background;
        }
    }
}
export class ThemeTrieElement {
    constructor(mainRule, rulesWithParentScopes = [], children = {}) {
        this._mainRule = mainRule;
        this._rulesWithParentScopes = rulesWithParentScopes;
        this._children = children;
    }
    static _sortBySpecificity(arr) {
        if (arr.length === 1) {
            return arr;
        }
        arr.sort(this._cmpBySpecificity);
        return arr;
    }
    static _cmpBySpecificity(a, b) {
        if (a.scopeDepth === b.scopeDepth) {
            const aParentScopes = a.parentScopes;
            const bParentScopes = b.parentScopes;
            let aParentScopesLen = aParentScopes === null ? 0 : aParentScopes.length;
            let bParentScopesLen = bParentScopes === null ? 0 : bParentScopes.length;
            if (aParentScopesLen === bParentScopesLen) {
                for (let i = 0; i < aParentScopesLen; i++) {
                    const aLen = aParentScopes[i].length;
                    const bLen = bParentScopes[i].length;
                    if (aLen !== bLen) {
                        return bLen - aLen;
                    }
                }
            }
            return bParentScopesLen - aParentScopesLen;
        }
        return b.scopeDepth - a.scopeDepth;
    }
    match(scope) {
        if (scope === '') {
            return ThemeTrieElement._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
        }
        let dotIndex = scope.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = scope;
            tail = '';
        }
        else {
            head = scope.substring(0, dotIndex);
            tail = scope.substring(dotIndex + 1);
        }
        if (this._children.hasOwnProperty(head)) {
            return this._children[head].match(tail);
        }
        return ThemeTrieElement._sortBySpecificity([].concat(this._mainRule).concat(this._rulesWithParentScopes));
    }
    insert(scopeDepth, scope, parentScopes, fontStyle, foreground, background) {
        if (scope === '') {
            this._doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background);
            return;
        }
        let dotIndex = scope.indexOf('.');
        let head;
        let tail;
        if (dotIndex === -1) {
            head = scope;
            tail = '';
        }
        else {
            head = scope.substring(0, dotIndex);
            tail = scope.substring(dotIndex + 1);
        }
        let child;
        if (this._children.hasOwnProperty(head)) {
            child = this._children[head];
        }
        else {
            child = new ThemeTrieElement(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes));
            this._children[head] = child;
        }
        child.insert(scopeDepth + 1, tail, parentScopes, fontStyle, foreground, background);
    }
    _doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background) {
        if (parentScopes === null) {
            // Merge into the main rule
            this._mainRule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
            return;
        }
        // Try to merge into existing rule
        for (let i = 0, len = this._rulesWithParentScopes.length; i < len; i++) {
            let rule = this._rulesWithParentScopes[i];
            if (strArrCmp(rule.parentScopes, parentScopes) === 0) {
                // bingo! => we get to merge this into an existing one
                rule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
                return;
            }
        }
        // Must add a new rule
        // Inherit from main rule
        if (fontStyle === -1 /* NotSet */) {
            fontStyle = this._mainRule.fontStyle;
        }
        if (foreground === 0) {
            foreground = this._mainRule.foreground;
        }
        if (background === 0) {
            background = this._mainRule.background;
        }
        this._rulesWithParentScopes.push(new ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background));
    }
}
