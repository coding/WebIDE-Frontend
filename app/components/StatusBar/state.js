import { observable } from 'mobx'

const state = observable({ messages: observable.map() })
export default state
