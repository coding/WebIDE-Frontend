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

const toJS = (subStore) => {
  if (subStore.toJS) {
    return subStore.toJS()
  }
  return mobxToJS(subStore)
}

extendObservable(store, {
  debug: false,
})

export const transform = createTransformer(mobxStore => ({
  PanelState: toJS(mobxStore.PanelState),
  PaneState: toJS(mobxStore.PaneState),
  EditorTabState: toJS(mobxStore.EditorTabState),
  FileTreeState: toJS(mobxStore.FileTreeState),
  FileState: toJS(mobxStore.FileState),
  SettingState: toJS(mobxStore.SettingState),
  PluginsState: toJS(mobxStore.PluginsState)
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

