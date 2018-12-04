import { toDefinition } from './actions'

export function createStyleSheet (container = document.getElementsByTagName('head')[0]) {
	const style = document.createElement('style')
	style.type = 'text/css'
	style.media = 'screen'
	container.appendChild(style)
	return style
}


// class DecorationCSSRules {

// 	private _theme: ITheme;
// 	private _className: string;
// 	private _unThemedSelector: string;
// 	private _hasContent: boolean;
// 	private _hasLetterSpacing: boolean;
// 	private _ruleType: ModelDecorationCSSRuleType;
// 	private _themeListener: IDisposable;
// 	private _providerArgs: ProviderArguments;
// 	private _usesThemeColors: boolean;

// 	public constructor(ruleType: ModelDecorationCSSRuleType, providerArgs: ProviderArguments, themeService: IThemeService) {
// 		this._theme = themeService.getTheme();
// 		this._ruleType = ruleType;
// 		this._providerArgs = providerArgs;
// 		this._usesThemeColors = false;
// 		this._hasContent = false;
// 		this._hasLetterSpacing = false;

// 		let className = CSSNameHelper.getClassName(this._providerArgs.key, ruleType);
// 		if (this._providerArgs.parentTypeKey) {
// 			className = className + ' ' + CSSNameHelper.getClassName(this._providerArgs.parentTypeKey, ruleType);
// 		}
// 		this._className = className;

// 		this._unThemedSelector = CSSNameHelper.getSelector(this._providerArgs.key, this._providerArgs.parentTypeKey, ruleType);

// 		this._buildCSS();

// 		if (this._usesThemeColors) {
// 			this._themeListener = themeService.onThemeChange(theme => {
// 				this._theme = themeService.getTheme();
// 				this._removeCSS();
// 				this._buildCSS();
// 			});
// 		}
// 	}

// 	public dispose() {
// 		if (this._hasContent) {
// 			this._removeCSS();
// 			this._hasContent = false;
// 		}
// 		if (this._themeListener) {
// 			this._themeListener.dispose();
// 			this._themeListener = null;
// 		}
// 	}

// 	public get hasContent(): boolean {
// 		return this._hasContent;
// 	}

// 	public get hasLetterSpacing(): boolean {
// 		return this._hasLetterSpacing;
// 	}

// 	public get className(): string {
// 		return this._className;
// 	}

// 	private _buildCSS(): void {
// 		let options = this._providerArgs.options;
// 		let unthemedCSS: string, lightCSS: string, darkCSS: string;
// 		switch (this._ruleType) {
// 			case ModelDecorationCSSRuleType.ClassName:
// 				unthemedCSS = this.getCSSTextForModelDecorationClassName(options);
// 				lightCSS = this.getCSSTextForModelDecorationClassName(options.light);
// 				darkCSS = this.getCSSTextForModelDecorationClassName(options.dark);
// 				break;
// 			case ModelDecorationCSSRuleType.InlineClassName:
// 				unthemedCSS = this.getCSSTextForModelDecorationInlineClassName(options);
// 				lightCSS = this.getCSSTextForModelDecorationInlineClassName(options.light);
// 				darkCSS = this.getCSSTextForModelDecorationInlineClassName(options.dark);
// 				break;
// 			case ModelDecorationCSSRuleType.GlyphMarginClassName:
// 				unthemedCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options);
// 				lightCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options.light);
// 				darkCSS = this.getCSSTextForModelDecorationGlyphMarginClassName(options.dark);
// 				break;
// 			case ModelDecorationCSSRuleType.BeforeContentClassName:
// 				unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options.before);
// 				lightCSS = this.getCSSTextForModelDecorationContentClassName(options.light && options.light.before);
// 				darkCSS = this.getCSSTextForModelDecorationContentClassName(options.dark && options.dark.before);
// 				break;
// 			case ModelDecorationCSSRuleType.AfterContentClassName:
// 				unthemedCSS = this.getCSSTextForModelDecorationContentClassName(options.after);
// 				lightCSS = this.getCSSTextForModelDecorationContentClassName(options.light && options.light.after);
// 				darkCSS = this.getCSSTextForModelDecorationContentClassName(options.dark && options.dark.after);
// 				break;
// 			default:
// 				throw new Error('Unknown rule type: ' + this._ruleType);
// 		}
// 		let sheet = <CSSStyleSheet>this._providerArgs.styleSheet.sheet;

// 		let hasContent = false;
// 		if (unthemedCSS.length > 0) {
// 			sheet.insertRule(`${this._unThemedSelector} {${unthemedCSS}}`, 0);
// 			hasContent = true;
// 		}
// 		if (lightCSS.length > 0) {
// 			sheet.insertRule(`.vs${this._unThemedSelector} {${lightCSS}}`, 0);
// 			hasContent = true;
// 		}
// 		if (darkCSS.length > 0) {
// 			sheet.insertRule(`.vs-dark${this._unThemedSelector}, .hc-black${this._unThemedSelector} {${darkCSS}}`, 0);
// 			hasContent = true;
// 		}
// 		this._hasContent = hasContent;
// 	}

// 	private _removeCSS(): void {
// 		dom.removeCSSRulesContainingSelector(this._unThemedSelector, this._providerArgs.styleSheet);
// 	}

// 	/**
// 	 * Build the CSS for decorations styled via `className`.
// 	 */
// 	private getCSSTextForModelDecorationClassName(opts: IThemeDecorationRenderOptions): string {
// 		if (!opts) {
// 			return '';
// 		}
// 		let cssTextArr: string[] = [];
// 		this.collectCSSText(opts, ['backgroundColor'], cssTextArr);
// 		this.collectCSSText(opts, ['outline', 'outlineColor', 'outlineStyle', 'outlineWidth'], cssTextArr);
// 		this.collectBorderSettingsCSSText(opts, cssTextArr);
// 		return cssTextArr.join('');
// 	}

// 	/**
// 	 * Build the CSS for decorations styled via `inlineClassName`.
// 	 */
// 	private getCSSTextForModelDecorationInlineClassName(opts: IThemeDecorationRenderOptions): string {
// 		if (!opts) {
// 			return '';
// 		}
// 		let cssTextArr: string[] = [];
// 		this.collectCSSText(opts, ['fontStyle', 'fontWeight', 'textDecoration', 'cursor', 'color', 'opacity', 'letterSpacing'], cssTextArr);
// 		if (opts.letterSpacing) {
// 			this._hasLetterSpacing = true;
// 		}
// 		return cssTextArr.join('');
// 	}

// 	/**
// 	 * Build the CSS for decorations styled before or after content.
// 	 */
// 	private getCSSTextForModelDecorationContentClassName(opts: IContentDecorationRenderOptions): string {
// 		if (!opts) {
// 			return '';
// 		}
// 		let cssTextArr: string[] = [];

// 		if (typeof opts !== 'undefined') {
// 			this.collectBorderSettingsCSSText(opts, cssTextArr);
// 			if (typeof opts.contentIconPath !== 'undefined') {
// 				if (typeof opts.contentIconPath === 'string') {
// 					cssTextArr.push(strings.format(_CSS_MAP.contentIconPath, URI.file(opts.contentIconPath).toString().replace(/'/g, '%27')));
// 				} else {
// 					cssTextArr.push(strings.format(_CSS_MAP.contentIconPath, URI.revive(opts.contentIconPath).toString(true).replace(/'/g, '%27')));
// 				}
// 			}
// 			if (typeof opts.contentText === 'string') {
// 				const truncated = opts.contentText.match(/^.*$/m)[0]; // only take first line
// 				const escaped = truncated.replace(/['\\]/g, '\\$&');

// 				cssTextArr.push(strings.format(_CSS_MAP.contentText, escaped));
// 			}
// 			this.collectCSSText(opts, ['fontStyle', 'fontWeight', 'textDecoration', 'color', 'opacity', 'backgroundColor', 'margin'], cssTextArr);
// 			if (this.collectCSSText(opts, ['width', 'height'], cssTextArr)) {
// 				cssTextArr.push('display:inline-block;');
// 			}
// 		}

// 		return cssTextArr.join('');
// 	}

// 	/**
// 	 * Build the CSS for decorations styled via `glpyhMarginClassName`.
// 	 */
// 	private getCSSTextForModelDecorationGlyphMarginClassName(opts: IThemeDecorationRenderOptions): string {
// 		if (!opts) {
// 			return '';
// 		}
// 		let cssTextArr = [];

// 		if (typeof opts.gutterIconPath !== 'undefined') {
// 			if (typeof opts.gutterIconPath === 'string') {
// 				cssTextArr.push(strings.format(_CSS_MAP.gutterIconPath, URI.file(opts.gutterIconPath).toString()));
// 			} else {
// 				cssTextArr.push(strings.format(_CSS_MAP.gutterIconPath, URI.revive(opts.gutterIconPath).toString(true).replace(/'/g, '%27')));
// 			}
// 			if (typeof opts.gutterIconSize !== 'undefined') {
// 				cssTextArr.push(strings.format(_CSS_MAP.gutterIconSize, opts.gutterIconSize));
// 			}
// 		}

// 		return cssTextArr.join('');
// 	}

// 	private collectBorderSettingsCSSText(opts: any, cssTextArr: string[]): boolean {
// 		if (this.collectCSSText(opts, ['border', 'borderColor', 'borderRadius', 'borderSpacing', 'borderStyle', 'borderWidth'], cssTextArr)) {
// 			cssTextArr.push(strings.format('box-sizing: border-box;'));
// 			return true;
// 		}
// 		return false;
// 	}

// 	private collectCSSText(opts: any, properties: string[], cssTextArr: string[]): boolean {
// 		let lenBefore = cssTextArr.length;
// 		for (let property of properties) {
// 			let value = this.resolveValue(opts[property]);
// 			if (typeof value === 'string') {
// 				cssTextArr.push(strings.format(_CSS_MAP[property], value));
// 			}
// 		}
// 		return cssTextArr.length !== lenBefore;
// 	}

// 	private resolveValue(value: string | ThemeColor): string {
// 		if (isThemeColor(value)) {
// 			this._usesThemeColors = true;
// 			let color = this._theme.getColor(value.id);
// 			if (color) {
// 				return color.toString();
// 			}
// 			return 'transparent';
// 		}
// 		return value;
// 	}
// }


// class DecorationTypeOptionsProvider {

// 	constructor(themeService, providerArgs) {
// 		this.refCount = 0;
// 		this._disposables = [];

// 		let createCSSRules = (type) => {
// 			let rules = new DecorationCSSRules(type, providerArgs, themeService);
// 			if (rules.hasContent) {
// 				this._disposables.push(rules);
// 				return rules.className;
// 			}
// 			return void 0;
// 		};
// 		let createInlineCSSRules = (type) => {
// 			let rules = new DecorationCSSRules(type, providerArgs, themeService);
// 			if (rules.hasContent) {
// 				this._disposables.push(rules);
// 				return { className: rules.className, hasLetterSpacing: rules.hasLetterSpacing };
// 			}
// 			return null;
// 		};

// 		this.className = createCSSRules(ModelDecorationCSSRuleType.ClassName);
// 		const inlineData = createInlineCSSRules(ModelDecorationCSSRuleType.InlineClassName);
// 		if (inlineData) {
// 			this.inlineClassName = inlineData.className;
// 			this.inlineClassNameAffectsLetterSpacing = inlineData.hasLetterSpacing;
// 		}
// 		this.beforeContentClassName = createCSSRules(ModelDecorationCSSRuleType.BeforeContentClassName);
// 		this.afterContentClassName = createCSSRules(ModelDecorationCSSRuleType.AfterContentClassName);
// 		this.glyphMarginClassName = createCSSRules(ModelDecorationCSSRuleType.GlyphMarginClassName);

// 		let options = providerArgs.options;
// 		this.isWholeLine = Boolean(options.isWholeLine);
// 		this.stickiness = options.rangeBehavior;

// 		let lightOverviewRulerColor = options.light && options.light.overviewRulerColor || options.overviewRulerColor;
// 		let darkOverviewRulerColor = options.dark && options.dark.overviewRulerColor || options.overviewRulerColor;
// 		if (
// 			typeof lightOverviewRulerColor !== 'undefined'
// 			|| typeof darkOverviewRulerColor !== 'undefined'
// 		) {
// 			this.overviewRuler = {
// 				color: lightOverviewRulerColor || darkOverviewRulerColor,
// 				darkColor: darkOverviewRulerColor || lightOverviewRulerColor,
// 				position: options.overviewRulerLane || OverviewRulerLane.Center
// 			};
// 		}
// 	}

// 	getOptions(codeEditorService, writable) {
// 		if (!writable) {
// 			return this;
// 		}
// 		return {
// 			inlineClassName: this.inlineClassName,
// 			beforeContentClassName: this.beforeContentClassName,
// 			afterContentClassName: this.afterContentClassName,
// 			className: this.className,
// 			glyphMarginClassName: this.glyphMarginClassName,
// 			isWholeLine: this.isWholeLine,
// 			overviewRuler: this.overviewRuler,
// 			stickiness: this.stickiness
// 		};
// 	}

// 	dispose() {
// 		this._disposables = disposeAll(this._disposables);
// 	}
// }

class CodeEditorService {
  constructor () {
    this._codeEditors = Object.create(null)
    this._diffEditors = Object.create(null)
    this._decorationOptionProviders = Object.create(null)
    this._styleSheet = createStyleSheet()
  }

  addCodeEditor (editor) {
    this._codeEditors[editor.getId()] = editor
  }

  removeCodeEditor (editor) {
    delete this._codeEditors[editor.getId()]
  }

  listCodeEditors () {
    return Object.keys(this._codeEditors).map(id => this._codeEditors[id])
  }

  addDiffEditor (editor) {
    this._diffEditors[editor.getId()] = editor
  }

  removeDiffEditor (editor) {
    delete this._diffEditors[editor.getId()]
  }

  listDiffEditors () {
    return Object.keys(this._diffEditors).map(id => this._diffEditors[id])
  }

  getFocusedCodeEditor () {
    let editorWithWidgetFocus = null

    const editors = this.listCodeEditors()
    for (let i = 0; i < editors.length; i++) {
      const editor = editors[i]

      if (editor.hasTextFocus()) {
        // bingo!
        return editor
      }

      if (editor.hasWidgetFocus()) {
        editorWithWidgetFocus = editor
      }
    }

    return editorWithWidgetFocus
  }

  registerDecorationType (key, options, parentTypeKey) {
    let provider = this._decorationOptionProviders[key]
    if (!provider) {
      const providerArags = {
        styleSheet: this._styleSheet,
        key,
        parentTypeKey,
        options: options || Object.create(null)
      };
      if (!parentTypeKey) {
        // provider = new 
      } else {
      // 
      }
    }
  }

  resolveDecorationOptions (key, is) {
    // return 
    console.log(key, is)
    return {}
  }

  doOpenEditor (editor, input) {
    return editor
  }

  openCodeEditor (input, source) {
    toDefinition(input)
    const editor = this.doOpenEditor(source, input)
    return monaco.Promise.as(editor)
  }
}

export default new CodeEditorService()
