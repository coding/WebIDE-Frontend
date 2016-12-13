import _ from 'lodash'
let localStoreCache = {}

const stateDomainsToCache = [
  'MarkdownEditorState',
  'ExtensionState',
  // 'FileTreeState',
  // 'PanelState',
  'PaneState',
  // 'TabState',
  // 'EditorState',
  'ModalState',
  // 'TerminalState',
  'GitState',
  'NotificationState',
  // 'WorkspaceState',
  // 'DragAndDrop',
  'SettingState',
]

const stateFilter = (state) => stateDomainsToCache.reduce((stateToCache, domain) => {
  if (!state) return ''
  stateToCache[domain] = state[domain]
  return stateToCache
}, {})


let cachedState
localStoreCache.beforeReducer = (state, action) => {
  // if (!state) state = JSON.parse(window.localStorage.getItem('snapshot'))
  cachedState = JSON.stringify(stateFilter(state))
  return state
}

localStoreCache.afterReducer = (state, action) => {
  let nextCachedState = JSON.stringify(stateFilter(state))
  if (nextCachedState !== cachedState) {
    window.localStorage.setItem('snapshot', nextCachedState)
    cachedState = nextCachedState
  }
  return state
}

export default localStoreCache
