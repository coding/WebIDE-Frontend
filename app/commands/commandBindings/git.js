/* @flow weak */
import store, { dispatch as $d } from '../../store'
import api from '../../api'
import * as Git from '../../components/Git/actions'
import * as Modal from '../../components/Modal/actions'

export default {
  'git:commit': c => {
    api.gitStatus().then(({files, clean}) => {
      $d(Git.updateStatus({files, isClean: clean}))
    }).then(() =>
      $d(Modal.showModal('GitCommit', 'HelloYo'))
    )
  },

  'git:pull': c => $d(Git.pull()),
  'git:push': c => $d(Git.push()),
  'git:resolve_conflicts': c => {
    api.gitStatus().then(({files, clean}) => {
      $d(Git.updateStatus({files, isClean: clean}))
    }).then(() =>
      $d(Modal.showModal('GitResolveConflicts'))
    )
  },

  // 'git:commit_and_push':
  'git:new_branch': c => {
    $d(Git.getBranches()).then(() =>
      $d(Git.getCurrentBranch()).then(() =>
        $d(Modal.showModal('GitNewBranch'))
      )
    )
  },
  'git:tag': c => {
    $d(Git.getCurrentBranch()).then(() =>
      $d(Modal.showModal('GitTag'))
    )
  },
  'git:merge': c => {
    $d(Git.getBranches()).then(() =>
      $d(Git.getCurrentBranch()).then(() =>
        $d(Modal.showModal('GitMerge'))
      )
    )
  },
  'git:stash': c => {
    $d(Git.getCurrentBranch()).then(() =>
      $d(Modal.showModal('GitStash'))
    )
  },
  'git:unstash': c => {
    $d(Git.getCurrentBranch()).then(() => {
      $d(Git.getStashList())
        .then(() =>
          $d(Modal.showModal('GitUnstash'))
        )
    })
  },
  'git:reset_head': c => {
    $d(Git.getCurrentBranch()).then(() =>
      $d(Modal.showModal('GitResetHead'))
    )
  },
  'git:rebase:start': c => {
    $d(Git.getBranches()).then(() => {
      $d(Git.getTags())
        .then(() =>
          $d(Modal.showModal('GitRebaseStart'))
        )
    })
  }
  // 'git:rebase:abort':
  // 'git:rebase:continue':
  // 'git:rebase:skip_commit':
}
