import { extendObservable, autorun, createTransformer, toJS as mobxToJS } from 'mobx'
import localforage from 'localforage'
import PanelState from './components/Panel/state'
import PaneState from './components/Pane/state'
import EditorTabState from './components/Tab/state'
import FileTreeState from './components/FileTree/state'
import SettingState from './components/Setting/state'
import FileState from './commons/File/state'
import EditorState from './components/Editor/state'
import persistStore from './persist'
import PluginsState from './components/Plugins/store'


const mainStore = localforage.createInstance({
  name: 'mainProject'
})

const store = {
  PanelState,
  PaneState,
  EditorTabState,
  FileTreeState,
  SettingState,
  FileState,
  PluginsState
}

const toJS = (store) => {
  if (store.toJS) {
    return store.toJS()
  }
  return mobxToJS(store)
}

extendObservable(store, {
  debug: false,
})

export const transform = createTransformer(store => ({
  PanelState: toJS(store.PanelState),
  PaneState: toJS(store.PaneState),
  EditorTabState: toJS(store.EditorTabState),
  FileTreeState: toJS(store.FileTreeState),
  FileState: toJS(store.FileState),
  SettingState: toJS(store.SettingState),
  PluginsState: toJS(store.PluginsState)
}))

export const persistTask = () => persistStore(store, transform)


autorun(() => {
  if (store.debug) {
    console.log('[mobx store] ', transform(store))
  }
})

export { mainStore }
export default store
window.mobxStore = store

