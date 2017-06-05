import { observable, computed, action, autorun, autorunAsync, runInAction } from 'mobx'
import { RandColors } from './helpers'
import CommitsState from './helpers/CommitsState'

const randColors = new RandColors()
const state = observable({
  refs: observable.map({}),
  rawCommits: observable.map({}),
  commitsState: observable.shallowObject({}),
})

autorun('parse commits', () => {
  state.commitsState = new CommitsState({
    rawCommits: state.rawCommits.values(),
  })
})

autorun('connect refs', () => {
  state.commitsState.refs = state.refs
})

export default state
