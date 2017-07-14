import { observable } from 'mobx'

const state = observable({
  collaborators: [],
  invited: [],
})

export default state
