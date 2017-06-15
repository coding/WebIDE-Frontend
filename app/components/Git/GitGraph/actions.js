import { action } from 'mobx'
import state from './state'
import api from 'backendAPI'
import getBackoff from 'utils/getBackoff'

export function fetchRefs () {
  return api.gitRefs().then(action(refs =>
    refs.forEach(ref => state.refs.set(ref.name, ref.id))
  ))
}

export function fetchCommits (params) {
  return api.gitLogs(params).then(action(allCommits => {
    allCommits.forEach(commit =>
      state.rawCommits.set(commit.id, commit)
    )
    return allCommits
  }))
}


export class CommitsCrawler {
  constructor (opt) {
    this.commits = opt.commits
    this.size = opt.size

    this.eldestCommitId = 'pristine'
    this.isFetching = false
    this.backoff = getBackoff({
      delayMin: 1500,
      delayMax: 10000,
    })
  }

  reachTheEndCallback () {
    const retryDelay = this.backoff.duration()
    this.isFetching = true
    setTimeout(() => this.isFetching = false, retryDelay)
  }

  fetch () {
    if (this.isFetching) return
    const page = Math.floor((this.commits.size || this.commits.length) / this.size)
    this.isFetching = fetchCommits({ page, size: this.size })
      .catch(() => false)
      .then(allCommits => {
        if (!allCommits) return this.isFetching = false
        if (!allCommits.length) { return this.reachTheEndCallback() }

        const eldestCommit = allCommits.pop()
        if (this.eldestCommitId === eldestCommit.id) {
          this.reachTheEndCallback()
        } else {
          setTimeout(() => this.isFetching = false, 100)
          this.eldestCommitId = eldestCommit.id
        }
      })
  }
}
