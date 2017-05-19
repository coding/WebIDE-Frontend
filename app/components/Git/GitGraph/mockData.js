import { observable, computed, action, runInAction } from 'mobx'
import state, { Commit }from './state'
import api from 'backendAPI'

export function genData () {
  api.gitLogs().then(allCommits => {
    // initialize the state
    allCommits.forEach(commitProps => {
      const commit = new Commit(commitProps)
    })
  })
}

export default state

