import { observable } from 'mobx'

export const ws = observable({
  name: '',
  status: false
})

export const searching = observable({
  pattern: '',
  path: '',
  caseSensitive: false,
  word: false,
  isPattern: false,
  singleFork: false
})

export const searched = observable({
  taskId: '',
  randomKey: '',
  pattern: false,
  message: '',
  results: [],
  end: true,
  former: {
      taskId: '',
      results: []
  }
})

const state = {
  ws,
  searching,
  searched
}

export default state;