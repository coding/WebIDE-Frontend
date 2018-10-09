import mobxStore from 'mobxStore'
import icons from 'file-icons-js'
import { uniqueId } from 'lodash'
import * as TabActions from 'components/Tab/actions'
import pluginStore from 'components/Plugins/store'
import tabStore from 'components/Tab/store'

export function getActiveEditor () {
  const { EditorTabState } = mobxStore
  const activeTab = EditorTabState.activeTab
  return activeTab ? activeTab.editorInfo.monacoEditor : null
}

export function openNewEditor (config) {
  const { path, contentType, ...other } = config
  TabActions.createTab({
    icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
    contentType,
    editor: {
      filePath: path,
      ...other,
    }
  })
}

export async function registerLanguage (languageConf) {
  const { contribution } = languageConf
  monaco.languages.register(contribution)

  monaco.languages.onLanguage(contribution.id, () => {
    contribution.loader()
      .then((mod) => {
        monaco.languages.setMonarchTokensProvider(contribution.id, mod.language)
        monaco.languages.setLanguageConfiguration(contribution.id, mod.conf)
      })
  })
}

export function registerFormattingEditProvider (languageId, provider) {
  // todo
}

export function registerCustomEditorView (component, conf) {
  const { name } = conf
  const type = `CUSTOM_EDITOR_VIEW_${name}`
  const showEditorView = (editorType, title, props) => {
    const tabId = uniqueId(editorType)
    tabStore.createTab({
      type: editorType,
      title,
      id: tabId,
      innerProps: props,
    })
    return tabId
  }

  const dispose = (tabId) => {
    const tab = tabStore.getTab(tabId)
    if (tab) {
      tab.destroy()
    }
  }
  pluginStore.editorViews.set(type, { type, component, dispatch: showEditorView, dispose })
  return {
    type,
    showEditorView,
    dispose,
  }
}
