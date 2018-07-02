import * as NotificationActions from 'components/Notification/actions'
import store, { dispatch as $d } from '../../store'
import api from '../../backendAPI'
import * as Git from '../../components/Git/actions'
import * as Modal from '../../components/Modal/actions'

export default {
  'git:remote': () => {
    Modal.showModal({ type: 'ResetRemote' })
  },
  'git:initialize': () => {
    api.gitInit()
      .then((data) => {
        NotificationActions.notify({
          message: data.msg
        })
      })
  },
  'git:commit': (c) => {
    api.gitStatus().then(({ files, clean }) => {
      $d(Git.updateStatus({ files, isClean: clean }))
    }).then(() =>
      Modal.showModal('GitCommit', 'HelloYo')
    )
  },

  'git:pull': c => $d(Git.pull()),
  'git:push': c => $d(Git.push()),
  'git:delete_branch': c => $d(Git.gitDeleteBranch(c).then(
    () => { $d(Git.getBranches()) }
  )),
  'git:resolve_conflicts': (c) => {
    api.gitStatus().then(({ files, clean }) => {
      files = _.filter(files, file => file.status == 'CONFLICTION')
      $d(Git.updateStatus({ files, isClean: clean }))
    }).then(() =>
      Modal.showModal('GitResolveConflicts')
    )
  },

  // 'git:commit_and_push':
  'git:checkout_new_branch': (c) => {
    $d(Git.getBranches()).then(() =>
      $d(Git.getCurrentBranch()).then(() =>
        Modal.showModal('GitCheckout', c.data)
      )
    )
  },
  'git:new_branch': (c) => {
    $d(Git.getBranches()).then(() =>
      $d(Git.getCurrentBranch()).then(() =>
        Modal.showModal('GitNewBranch')
      )
    )
  },
  'git:tag': (c) => {
    $d(Git.getCurrentBranch()).then(() =>
      $d(Git.getTags())
        .then(() =>
          Modal.showModal('GitTag')
        )
    )
  },
  'git:merge': (c) => {
    $d(Git.getBranches()).then(() =>
      $d(Git.getCurrentBranch()).then(() =>
        Modal.showModal('GitMerge')
      )
    )
  },
  'git:stash': (c) => {
    $d(Git.getCurrentBranch()).then(() =>
      Modal.showModal('GitStash')
    )
  },
  'git:unstash': (c) => {
    $d(Git.getCurrentBranch()).then(() => {
      $d(Git.getStashList())
        .then(() =>
          Modal.showModal('GitUnstash')
        )
    })
  },
  'git:reset_head': (c) => {
    $d(Git.getCurrentBranch()).then(() =>
      Modal.showModal('GitResetHead')
    )
  },
  'git:rebase:start': (c) => {
    $d(Git.getBranches()).then(() => {
      $d(Git.getTags())
        .then(() =>
          Modal.showModal('GitRebaseStart')
        )
    })
  },
  'git:rebase:abort': (c) => {
    $d(Git.gitRebaseOperate({ operation: 'ABORT' }))
  },
  'git:rebase:continue': (c) => {
    $d(Git.gitRebaseOperate({ operation: 'CONTINUE' }))
  },
  'git:rebase:skip_commit': (c) => {
    $d(Git.gitRebaseOperate({ operation: 'SKIP' }))
  },
  'git:history:compare': (c) => {
    const focusedNode = c.context.focusedNode
    $d(Git.diffFile({
      path: focusedNode.path,
      newRef: c.context.shortName,
      oldRef: `${c.context.shortName}^`
    }))
  },
  'git:history:compare_local': (c) => {
    const focusedNode = c.context.focusedNode
    if (!focusedNode || focusedNode.isDir) {
      $d(Git.gitCommitDiff({
        rev: c.context.shortName,
        title: 'Show Commit'
      }))
    } else {
      $d(Git.diffFile({
        path: focusedNode.path,
        newRef: c.context.shortName,
        oldRef: '~~unstaged~~'
      }))
    }
  },
  'git:history:all_effected': (c) => {
    $d(Git.gitCommitDiff({
      rev: c.context.shortName,
      title: 'Show Commit',
      oldRef: `${c.context.shortName}^`
    }))
  }
}
