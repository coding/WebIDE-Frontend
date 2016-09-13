import { createStore } from 'redux';
import reducers from '../reducers';

var store = createStore(reducers)
console.log(store);

export default store;
