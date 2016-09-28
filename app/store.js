/* @flow weak */
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

import PaneReducerGenerator from './components/Pane/reducer'
import TabReducer from './components/Tab/reducer'
import EditorReducer from './components/AceEditor/reducer'
import FileTreeReducer from './components/FileTree/reducer'
import ModalReducer from './components/Modal/reducer'
import NotificationReducer from './components/Notification/reducer'
import TerminalReducer from './components/Terminal/reducer'
import GitReducer from './components/Git/reducer'
import WorkspaceReducer from './components/Workspace/reducer'

const reducers = combineReducers({
  WindowPaneState: PaneReducerGenerator('window'),
  EditorPaneState: PaneReducerGenerator('editor'),
  TabState: TabReducer,
  EditorState: EditorReducer,
  FileTreeState: FileTreeReducer,
  ModalState: ModalReducer,
  TerminalState: TerminalReducer,
  GitState: GitReducer,
  NotificationState: NotificationReducer,
  WorkspaceState: WorkspaceReducer
})

export default createStore(reducers, applyMiddleware(thunkMiddleware))
