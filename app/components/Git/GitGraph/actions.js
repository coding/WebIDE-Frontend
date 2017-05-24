import state, { Commit } from './state'
import api from 'backendAPI'

export function fetchRefs () {
  return api.gitRefs().then(refs =>
    refs.forEach(ref => state.refs.set(ref.name, ref.id))
  )
}

export function fetchCommits (params) {
  return api.gitLogs(params).then(allCommits => {
    allCommits.forEach(commitProps => {
      const commit = new Commit(commitProps)
    })
  })
}

