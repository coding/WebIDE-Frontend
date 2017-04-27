/* @flow weak */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { composeReducers } from './utils'
import { dispatch as emitterDispatch, emitterMiddleware } from 'utils/actions'
import thunkMiddleware from 'redux-thunk'

import MarkdownEditorReducer from './components/MarkdownEditor/reducer'
import PanelReducer from './components/Panel/reducer'
import PaneReducer, { PaneCrossReducer } from './components/Pane/reducer'
// import TabReducer, { TabCrossReducer } from './components/Tab/reducer'
import EditorTabReducer from './components/Editor/reducer'
import FileTreeReducer from './components/FileTree/reducer'
import ModalsReducer from './components/Modal/reducer'
import NotificationReducer from './components/Notification/reducer'
import TerminalReducer from './components/Terminal/reducer'
import GitReducer from './components/Git/reducer'
import RootReducer from './containers/Root/reducer'
import PackageReducer, { PackageCrossReducer } from './components/Package/reducer'
import StatusBarReducer from './components/StatusBar/reducer'

import localStoreCache from './localStoreCache'

const combinedReducers = combineReducers({
  MarkdownEditorState: MarkdownEditorReducer,
  PackageState: PackageReducer,
  FileTreeState: FileTreeReducer,
  PanelState: PanelReducer,
  PaneState: PaneReducer,
  // TabState: TabReducer,
  EditorTabState: EditorTabReducer,
  ModalState: ModalsReducer,
  TerminalState: TerminalReducer,
  GitState: GitReducer,
  NotificationState: NotificationReducer,
  StatusBarState: StatusBarReducer,
})

const crossReducers = composeReducers(RootReducer, PaneCrossReducer, PackageCrossReducer)
const finalReducer = composeReducers(
  localStoreCache.afterReducer,
  crossReducers,
  combinedReducers,
  localStoreCache.beforeReducer
)

const enhancer = compose(
  applyMiddleware(thunkMiddleware, emitterMiddleware),
  window.devToolsExtension ? window.devToolsExtension({
    serialize: {
      replacer: (key, value) => {
        if (key === 'editor') return {}
        if (key === 'DOMNode') return {}
        return value
      }
    }
  }) : f => f
)
// enhancer = applyMiddleware(thunkMiddleware)
const store = createStore(finalReducer, enhancer)
window.getState = store.getState
window.dispatch = store.dispatch


window.addEventListener('storage', (e) => {
  if (e.key && e.key.includes('CodingPackage')) {
    store.dispatch({ type: 'UPDATE_EXTENSION_CACHE' })
  }
})

export default store
export const getState = store.getState
export const dispatch = store.dispatch
