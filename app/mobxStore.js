import { autorun, createTransformer, toJS } from 'mobx'
import PaneState from './components/Pane/state'
import EditorTabState from './components/Editor/state'
import FileTreeState from './components/FileTree/state'
const store = {
  PaneState,
  EditorTabState,
  FileTreeState,
}

const transform = createTransformer(store => {
  return {
    PaneState: toJS(store.PaneState),
    EditorTabState: toJS(store.EditorTabState),
  }
})
autorun(_ => {
  let transformedStore = transform(store)
  console.log('[mobx store] ', transformedStore)
})

export default store
