/* @flow weak */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { composeReducers } from './utils'
import thunkMiddleware from 'redux-thunk'

import MarkdownEditorReducer from './components/MarkdownEditor/reducer'
import PanelReducer from './components/Panel/reducer'
import PaneReducer, { PaneCrossReducer } from './components/Pane/reducer'
import TabReducer from './components/Tab/reducer'
import EditorReducer from './components/AceEditor/reducer'
import FileTreeReducer from './components/FileTree/reducer'
import ModalsReducer from './components/Modal/reducer'
import NotificationReducer from './components/Notification/reducer'
import TerminalReducer from './components/Terminal/reducer'
import GitReducer from './components/Git/reducer'
import WorkspaceReducer from './components/Workspace/reducer'
import DragAndDropReducer from './components/DragAndDrop/reducer'
import SettingReducer from './components/Setting/reducer'
import RootReducer from './containers/Root/reducer'

const combinedReducers = combineReducers({
  MarkdownEditorState: MarkdownEditorReducer,
  FileTreeState: FileTreeReducer,
  PanelState: PanelReducer,
  PaneState: PaneReducer,
  TabState: TabReducer,
  EditorState: EditorReducer,
  ModalState: ModalsReducer,
  TerminalState: TerminalReducer,
  GitState: GitReducer,
  NotificationState: NotificationReducer,
  WorkspaceState: WorkspaceReducer,
  DragAndDrop: DragAndDropReducer,
  SettingState: SettingReducer,
})

const crossReducers = composeReducers(RootReducer, PaneCrossReducer)
const finalReducer = composeReducers(crossReducers, combinedReducers)

// const store = createStore(finalReducer, compose(
//   applyMiddleware(thunkMiddleware),
//   window.devToolsExtension ? window.devToolsExtension() : f => f));
const store = createStore(finalReducer, applyMiddleware(thunkMiddleware))
window.getState = store.getState


store.subscribe(() => {
  const updateStoreToRemoteInterval = 10000

  const stateFromStorage = localStorage.getItem('snapshot')
  const newState = store.getState()
  const newStateWithoutCircular = JSON.stringify(newState.SettingState)
  const createTimeEvent = () => {
    window.timer = setTimeout(() => {
      console.log('update state to remote')
      clearTimeout(window.timer)
    }, updateStoreToRemoteInterval)
  }

  // update local state
  if ((stateFromStorage !== newStateWithoutCircular) || !stateFromStorage) {
    console.log('update state to localstorage')
    localStorage.setItem('snapshot', newStateWithoutCircular)
    if (window.timer) clearTimeout(window.timer)
    createTimeEvent()
  }
})
export default store
export const getState = store.getState
export const dispatch = store.dispatch
