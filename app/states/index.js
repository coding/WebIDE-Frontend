/* @flow weak */
import { createStore } from 'redux'
import reducers from '../reducers'

var store = createStore(reducers)

export default store
