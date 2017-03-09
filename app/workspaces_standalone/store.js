/* @flow weak */
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import WorkspaceReducer from './reducer'

const enhancer = compose(
  applyMiddleware(thunkMiddleware),
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
const store = createStore(WorkspaceReducer, enhancer)

export default store
export const getState = store.getState
export const dispatch = store.dispatch
