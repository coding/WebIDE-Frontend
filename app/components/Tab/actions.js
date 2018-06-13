import { reaction, when } from 'mobx'
import mobxStore from 'mobxStore'
import { createAction, registerAction } from 'utils/actions'
import state, { Tab, TabGroup } from './state'
import dispatchCommand from 'commands/dispatchCommand'
import TabState from 'components/Tab/state';
import FileState from 'commons/File/state';
import FileStore from 'commons/File/store';
import api from '../../backendAPI';
import icons from 'file-icons-js';
import LanguageState from './LanguageClientState'
import config from 'config'
import { findLangueByExt } from 'components/MonacoEditor/utils/findLanguage'
import { createLanguageClient } from 'components/MonacoEditor/actions'

export const TAB_CREATE = 'TAB_CREATE'
export const TAB_STORE_HYDRATE = 'TAB_STORE_HYDRATE'

export const hydrate = registerAction(TAB_STORE_HYDRATE, (json) => {
  const tabs = Object.values(json.tabs).sort((a, b) => a.index - b.index);
  const tabGroups = Object.values(json.tabGroups);
  tabGroups.forEach((tabGroupsValue) => createGroup(tabGroupsValue.id));
  if (tabs.length === 0) {
    dispatchCommand('global:show_env')
    return;
  }
  when(() => !FileState.initData.get('_init'), () => {
    const mountedTabIds = [];
    const openTabs = tabs.map((tabValue) => {
      const { path, editor, contentType, ...others } = tabValue
      const { encoding } = FileState.initData.get(path) || {}
      return api.readFile(path, encoding).then(data => {
        FileStore.loadNodeData(data)
        createTab({
          icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
          contentType,
          editor: {
            ...editor,
            filePath: path,
          },
          ...others,
        })
        const thisTabId = Object.values(TabState.tabs._data).map(tab => tab.value.id).pop();
        let hasFindIndex = false;
        mountedTabIds.push(thisTabId);
        for (let i = 0, n = tabs.length; i < n; i++) {
          const curTabId = tabs[i].id;
          if (hasFindIndex && mountedTabIds.includes(curTabId)) {
            insertTabBefore(thisTabId, curTabId);
            break;
          }
          if (thisTabId === curTabId) {
            hasFindIndex = true;
          }
        }
        return data;
      });
    });
    Promise.all(openTabs).then(data => {
      Object.values(tabGroups).forEach((tabGroupsValue) => {
        if (tabGroupsValue.activeTabId) {
          setTimeout(() => {
            activateTab(tabGroupsValue.activeTabId)
          }, 1)
        }
      })
    })
  })
})

export const createTab = registerAction(TAB_CREATE,
  (tabProps) => {
    const tab = new Tab(tabProps)
    if (config.enableNewEditor) {
      const { editor } = tabProps
      if (editor.filePath) {
        const { filePath } = editor
        const ext = filePath.split('.').pop()
        const language = findLangueByExt(ext) ? findLangueByExt(ext).language : ''
        when(() => config.mainLanguage !== '', () => {
          /**
           * 创建新的tab（打开新文件）时
           * 判断文件是否与项目默认语言相同且还没有开启语言服务
           * 项目默认语言只能通过语言服务菜单设定 或当前项目根目录下有项目相关构建工具的文件 （pom.xml/package.json）
           */
          if (!LanguageState.clients.get(language) && language !== '' && language === config.mainLanguage) {
            createLanguageClient(language)
          }
        })
      }
    }
  },
)

export const removeTab = registerAction('tab:remove', (tab) => {
  // const tab = state.tabs.get(tabId)
  tab.destroy()
})

export const removeOtherTab = registerAction('tab:remove_other', (tab) => {
  // const tab = state.tabs.get(tabId)
  tab.activate()
  tab.tabGroup.tabs.forEach((eachTab) => {
    if (eachTab !== tab) eachTab.destroy()
  })
})

export const removeAllTab = registerAction('tab:remove_all', (tab) => {
  // const tab = state.tabs.get(tabId)
  tab.tabGroup.tabs.forEach(tab => tab.destroy())
})


export const activateTab = registerAction('tab:activate', (tab) => {
  // const tab = state.tabs.get(tabId)
  if (tab && tab.activate) {
    tab.activate()
  }
})

export const createGroup = registerAction('tab:create_tab_group',
  (groupId) => {
    new TabGroup({ id: groupId })
  }
)

export const removeGroup = registerAction('tab:remove_tab_group',
  (groupId) => {
    const tab = state.tabs.get(groupId)
  }
)

export const updateTab = registerAction('tab:update',
  (tabProps = {}) => {
    const tabId = tabProps.id
    const tab = state.tabs.get(tabId)
    if (tab) tab.update(tabProps)
  }
)

export const TAB_UPDATE_BY_PATH = 'TAB_UPDATE_BY_PATH'
export const updateTabByPath = registerAction(TAB_UPDATE_BY_PATH, (tabProps = {}) => tabProps)

export const TAB_UPDATE_FLAGS = 'TAB_UPDATE_FLAGS'
export const updateTabFlags = registerAction('tab:update_flags', (tabId, flag, value = true) => {
  let flags
  if (typeof flag === 'string') {
    flags = { [flag]: value }
  } else if (typeof flag === 'object') {
    flags = flag
  }
  return { tabId, flags }
},
  ({ tabId, flags }) => {
    const tab = state.tabs.get(tabId)
    if (!tab || !flags) return
    tab.flags = flags
  }
)

export const moveTabToGroup = registerAction('tab:move_to_tab_group',
  (tabId, groupId) => ({ tabId, groupId }),
  ({ tabId, groupId }) => {
    const tab = state.tabs.get(tabId)
    const tabGroup = state.tabGroups.get(groupId)
    if (!tab || !tabGroup) return
    tabGroup.addTab(tab)
  }
)

export const TAB_INSERT_AT = 'TAB_INSERT_AT'
export const insertTabBefore = registerAction(TAB_INSERT_AT,
  (tabId, beforeTabId) => ({ tabId, beforeTabId }),
  ({ tabId, beforeTabId }) => {
    const tab = state.tabs.get(tabId)
    const anchorTab = state.tabs.get(beforeTabId)
    const prev = anchorTab.prev
    const insertIndex = (prev) ? (anchorTab.index + prev.index) / 2 : -1
    anchorTab.tabGroup.addTab(tab, insertIndex)
  }
)

export const TAB_CONTEXT_MENU_OPEN = 'TAB_CONTEXT_MENU_OPEN'
export const openContextMenu = registerAction(TAB_CONTEXT_MENU_OPEN, (e, node, tabGroupId) => {
  e.stopPropagation()
  e.preventDefault()

  return {
    isActive: true,
    pos: { x: e.clientX, y: e.clientY },
    contextNode: node,
    tabGroupId
  }
})

export const TAB_CONTEXT_MENU_CLOSE = 'TAB_CONTEXT_MENU_CLOSE'
export const closeContextMenu = createAction(TAB_CONTEXT_MENU_CLOSE)


export const TAB_MOVE_TO_PANE = 'TAB_MOVE_TO_PANE'
export const moveTabToPane = registerAction(TAB_MOVE_TO_PANE,
  (tabId, paneId) => ({ tabId, paneId }),
  ({ tabId, paneId }) => {
    const pane = mobxStore.PaneState.panes.get(paneId)
    const tab = mobxStore.EditorTabState.tabs.get(tabId)
    tab.tabGroup.removeTab(tab)
    pane.tabGroup.addTab(tab)
    return mobxStore
  }
)
