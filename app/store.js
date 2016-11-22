/* @flow weak */
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { composeReducers } from './utils'
import thunkMiddleware from 'redux-thunk'

import MarkdownEditorReducer from './components/MarkdownEditor/reducer';
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

console.log('MarkdownEditorReducer', MarkdownEditorReducer);
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
  DragAndDrop: DragAndDropReducer
})

const crossReducers = composeReducers(PaneCrossReducer)
const finalReducer = composeReducers(crossReducers, combinedReducers)

// const store = createStore(finalReducer, compose(
//   applyMiddleware(thunkMiddleware), 
//   window.devToolsExtension ? window.devToolsExtension() : f => f));
const store = createStore(finalReducer, applyMiddleware(thunkMiddleware))
window.getState = store.getState
export default store
export const getState = store.getState
export const dispatch = store.dispatch
