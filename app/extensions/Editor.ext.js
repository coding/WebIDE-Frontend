import mobxStore from 'mobxStore'
import icons from 'file-icons-js'
import { uniqueId, isArray, isFunction } from 'lodash'
import * as TabActions from 'components/Tab/actions'
import pluginStore from 'components/Plugins/store'
import editorState from 'components/MonacoEditor/state'
import tabStore from 'components/Tab/store'
import Color from 'color'
import { monacoThemeOptions } from '../settings'
import { editorSet } from 'components/MonacoEditor/Editors';

export function getActiveEditor () {
  const { EditorTabState } = mobxStore
  const activeTab = EditorTabState.activeTab
  return activeTab
    ? {
      uri: activeTab.file ? activeTab.file.path : null,
      editor: activeTab.editorInfo.monacoEditor
    }
    : null
}

export function openNewEditor (config) {
  const { path, contentType, ...other } = config
  TabActions.createTab({
    icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
    contentType,
    editor: {
      filePath: path,
      ...other
    }
  })
}

export function registerLanguage (languageConf) {
  const { contribution } = languageConf
  monaco.languages.register(contribution)
  monaco.languages.onLanguage(contribution.id, () => contribution.loader().then((mod) => {
    monaco.languages.setMonarchTokensProvider(contribution.id, mod.language)
    monaco.languages.setLanguageConfiguration(contribution.id, mod.conf)
  }))
}

export function registerFormattingEditProvider (languageId, provider) {
  // todo
}

export function registerEditorViewByContentTypes(editor, contentTypes) {
  // 注册编辑器
  editorSet.unshift({ editor, contentTypes });
  // dispose
  return () => {
    editorSet = editorSet.filter(editor => String(editor.contentTypes) !== String(contentTypes));
  }
}

export function registerContentProvider (component, conf) {
  const { name } = conf
  const type = `CUSTOM_EDITOR_VIEW_${name}`
  const activate = (editorType, title, props) => {
    const tabId = uniqueId(editorType)
    tabStore.createTab({
      type: editorType,
      title,
      id: tabId,
      innerProps: props
    })
    return tabId
  }

  const dispose = (tabId) => {
    const tab = tabStore.getTab(tabId)
    if (tab) {
      tab.destroy()
    }
  }
  pluginStore.editorViews.set(type, { type, component, dispatch: activate, dispose })
  return {
    editorType: type,
    activate,
    dispose
  }
}

export function removeEditorMountListener (fn) {
  editorState.mountListeners = editorState.mountListeners.filter(f => f !== fn)
}

export function registerEditorDidMountHandler (fn) {
  editorState.mountListeners.push(fn)
  return () => {
    removeEditorMountListener(fn)
  }
}

const sanitizeColor = (color) => {
  if (!color) {
    return color
  }

  if (/#......$/.test(color) || /#........$/.test(color)) {
    return color
  }

  try {
    return new Color(color).hexString()
  } catch (e) {
    return '#FF0000'
  }
}

const colorsAllowed = ({ foreground, background }) => {
  if (foreground === 'inherit' || background === 'inherit') {
    return false
  }

  return true
}

const getTheme = (theme) => {
  const { tokenColors = [], colors = {} } = theme
  const rules = tokenColors
    .filter(t => t.settings && t.scope && colorsAllowed(t.settings))
    .reduce((acc, token) => {
      const settings = {
        foreground: sanitizeColor(token.settings.foreground),
        background: sanitizeColor(token.settings.background),
        fontStyle: token.settings.fontStyle
      }

      const scope =
        typeof token.scope === 'string' ? token.scope.split(',').map(a => a.trim()) : token.scope

      scope.map(s =>
        acc.push({
          token: s,
          ...settings
        })
      )

      return acc
    }, [])

  const newColors = colors
  Object.keys(colors).forEach((c) => {
    if (newColors[c]) return c

    delete newColors[c]

    return c
  })

  return {
    colors: newColors,
    rules,
    type: theme.type
  }
}

const getBase = (type) => {
  if (type === 'dark') {
    return 'vs-dark'
  }

  if (type === 'hc') {
    return 'hc-black'
  }

  return 'vs'
}

export function defineTheme (name, themeData) {
  if (monacoThemeOptions.includes(name)) {
    throw new Error(`${name} is already exits`)
  }
  const transformedTheme = getTheme(themeData)
  monacoThemeOptions.push(name)
  try {
    monaco.editor.defineTheme(name, {
      base: getBase(transformedTheme.type),
      inherit: true,
      colors: transformedTheme.colors,
      rules: transformedTheme.rules
    })
  } catch (e) {
    console.error(e)
  }
}

export function registerActiveEditorChangeHandler (fn) {
  editorState.activeEditorListeners.push(fn)
  return () => {
    editorState.activeEditorListeners = editorState.activeEditorListeners.filter(f => f !== fn)
  }
}

function _registerCodeSnippets (language, snippetsProvider) {
  return monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems () {
      return isFunction(snippetsProvider) ? snippetsProvider() : snippetsProvider
    }
  })
}

export function registerCodeSnippetsProvider (languages, snippetsProvider) {
  if (isArray(languages)) {
    const disposes = []
    for (const lang of languages) {
      disposes.push(_registerCodeSnippets(lang, snippetsProvider))
    }
    return disposes
  } else {
    return [_registerCodeSnippets(languages, snippetsProvider)]
  }
}

export const SnippetsItemKind = {
  Text: 0,
  Method: 1,
  Function: 2,
  Constructor: 3,
  Field: 4,
  Variable: 5,
  Class: 6,
  Interface: 7,
  Module: 8,
  Property: 9,
  Unit: 10,
  Value: 11,
  Enum: 12,
  Keyword: 13,
  Snippet: 14,
  Color: 15,
  File: 16,
  Reference: 17,
  Folder: 18
}
