/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import { SyncRegistry } from './registry';
import { parseJSONGrammar, parsePLISTGrammar } from './grammarReader';
import { Theme } from './theme';
import { StackElement as StackElementImpl } from './grammar';
let DEFAULT_OPTIONS = {
    getGrammarDefinition: (scopeName) => null,
    getInjections: (scopeName) => null
};
/**
 * The registry that will hold all grammars.
 */
export class Registry {
    constructor(locator = DEFAULT_OPTIONS) {
        this._locator = locator;
        this._syncRegistry = new SyncRegistry(Theme.createFromRawTheme(locator.theme));
        this.installationQueue = new Map();
    }
    /**
     * Change the theme. Once called, no previous `ruleStack` should be used anymore.
     */
    setTheme(theme) {
        this._syncRegistry.setTheme(Theme.createFromRawTheme(theme));
    }
    /**
     * Returns a lookup array for color ids.
     */
    getColorMap() {
        return this._syncRegistry.getColorMap();
    }
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    loadGrammarWithEmbeddedLanguages(initialScopeName, initialLanguage, embeddedLanguages) {
        return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages });
    }
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     * Please do not use language id 0.
     */
    async loadGrammarWithConfiguration(initialScopeName, initialLanguage, configuration) {
        await this._loadGrammar(initialScopeName);
        return this.grammarForScopeName(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes);
    }
    /**
     * Load the grammar for `scopeName` and all referenced included grammars asynchronously.
     */
    async loadGrammar(initialScopeName) {
        return this._loadGrammar(initialScopeName);
    }
    async _loadGrammar(initialScopeName, dependentScope = null) {
        // already installed
        if (this._syncRegistry.lookup(initialScopeName)) {
            return this.grammarForScopeName(initialScopeName);
        }
        // installation in progress
        if (this.installationQueue.has(initialScopeName)) {
            return this.installationQueue.get(initialScopeName);
        }
        // start installation process
        const prom = new Promise(async (resolve, reject) => {
            let grammarDefinition = await this._locator.getGrammarDefinition(initialScopeName, dependentScope);
            if (!grammarDefinition) {
                throw new Error(`Load failed. initialScopeName:${initialScopeName}, dependentScope:${dependentScope}`);
            }
            if ((grammarDefinition.format !== 'json' && grammarDefinition.format !== 'plist') ||
                (grammarDefinition.format === 'json' && typeof grammarDefinition.content !== 'object' && typeof grammarDefinition.content !== 'string') ||
                (grammarDefinition.format === 'plist' && typeof grammarDefinition.content !== 'string')) {
                throw new TypeError('Grammar definition must be an object, either `{ content: string | object, format: "json" }` OR `{ content: string, format: "plist" }`)');
            }
            const rawGrammar = grammarDefinition.format === 'json'
                ? typeof grammarDefinition.content === 'string'
                    ? parseJSONGrammar(grammarDefinition.content, 'c://fakepath/grammar.json')
                    : grammarDefinition.content
                : parsePLISTGrammar(grammarDefinition.content, 'c://fakepath/grammar.plist');
            let injections = (typeof this._locator.getInjections === 'function') && this._locator.getInjections(initialScopeName);
            rawGrammar.scopeName = initialScopeName;
            let deps = this._syncRegistry.addGrammar(rawGrammar, injections);
            await Promise.all(deps.map(async (scopeNameD) => {
                try {
                    return this._loadGrammar(scopeNameD, initialScopeName);
                }
                catch (error) {
                    throw new Error(`While trying to load tmGrammar with scopeId: '${initialScopeName}', it's dependency (scopeId: ${scopeNameD}) loading errored: ${error.message}`);
                }
            }));
            resolve(this.grammarForScopeName(initialScopeName));
        });
        this.installationQueue.set(initialScopeName, prom);
        await prom;
        this.installationQueue.delete(initialScopeName);
        return prom;
    }
    /**
     * Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `loadGrammarFromPathSync`.
     */
    grammarForScopeName(scopeName, initialLanguage = 0, embeddedLanguages = null, tokenTypes = null) {
        return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes);
    }
}
export const INITIAL = StackElementImpl.NULL;
