/* @flow weak */
import store from '../../store'
const { getState, dispatch: $d } = store

import api from '../../api'
import * as Git from '../../components/Git/actions'
import * as Modal from '../../components/Modal/actions'

export default {
  'git:commit': c => {
    api.gitStatus().then( ({files, clean}) => {
      $d( Git.updateStatus({files, isClean: clean}) )
    }).then( () =>
      $d( Modal.showModal('GitCommit', 'HelloYo') )
    )
  },

  'git:pull': c => $d( Git.pull() ),
  'git:push': c => $d( Git.push() ),

  // 'git:commit_and_push':
  // 'git:branch':
  // 'git:tag':
  // 'git:merge':
  // 'git:resolve_conflicts':
  // 'git:stash':
  // 'git:unstash'<:></:>
  // 'git:reset_head':
  // 'git:rebase:start':
  // 'git:rebase:abort':
  // 'git:rebase:continue':
  // 'git:rebase:skip_commit':
}
