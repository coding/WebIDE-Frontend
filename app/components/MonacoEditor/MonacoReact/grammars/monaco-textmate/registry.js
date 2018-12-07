/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
import { createGrammar, collectIncludedScopes } from './grammar';
export class SyncRegistry {
    constructor(theme) {
        this._theme = theme;
        this._grammars = {};
        this._rawGrammars = {};
        this._injectionGrammars = {};
    }
    setTheme(theme) {
        this._theme = theme;
        Object.keys(this._grammars).forEach((scopeName) => {
            let grammar = this._grammars[scopeName];
            grammar.onDidChangeTheme();
        });
    }
    getColorMap() {
        return this._theme.getColorMap();
    }
    /**
     * Add `grammar` to registry and return a list of referenced scope names
     */
    addGrammar(grammar, injectionScopeNames) {
        this._rawGrammars[grammar.scopeName] = grammar;
        let includedScopes = {};
        collectIncludedScopes(includedScopes, grammar);
        if (injectionScopeNames) {
            this._injectionGrammars[grammar.scopeName] = injectionScopeNames;
            injectionScopeNames.forEach(scopeName => {
                includedScopes[scopeName] = true;
            });
        }
        return Object.keys(includedScopes);
    }
    /**
     * Lookup a raw grammar.
     */
    lookup(scopeName) {
        return this._rawGrammars[scopeName];
    }
    /**
     * Returns the injections for the given grammar
     */
    injections(targetScope) {
        return this._injectionGrammars[targetScope];
    }
    /**
     * Get the default theme settings
     */
    getDefaults() {
        return this._theme.getDefaults();
    }
    /**
     * Match a scope in the theme.
     */
    themeMatch(scopeName) {
        return this._theme.match(scopeName);
    }
    /**
     * Lookup a grammar.
     */
    grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes) {
        if (!this._grammars[scopeName]) {
            let rawGrammar = this._rawGrammars[scopeName];
            if (!rawGrammar) {
                return null;
            }
            this._grammars[scopeName] = createGrammar(rawGrammar, initialLanguage, embeddedLanguages, tokenTypes, this);
        }
        return this._grammars[scopeName];
    }
}
