import { extendObservable, autorun, createTransformer, toJS } from 'mobx'
import PaneState from './components/Pane/state'
import EditorTabState from './components/Tab/state'
import FileTreeState from './components/FileTree/state'
import SettingState from './components/Setting/state'
import FileState from './commons/File/state'

const store = {
  PaneState,
  EditorTabState,
  FileTreeState,
  SettingState,
  FileState,
}

extendObservable(store, {
  debug: false,
})
const transform = createTransformer(store => ({
  PaneState: toJS(store.PaneState),
  EditorTabState: toJS(store.EditorTabState),
  FileTreeState: toJS(store.FileTreeState),
  FileState: toJS(store.FileState)
}))

autorun(() => {
  if (store.debug) {
    const transformedStore = transform(store)
    console.log('[mobx store] ', transformedStore)
  }
})

export default store
window.mobxStore = store
