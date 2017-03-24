/* @flow weak */
import store from '../../store.js'
import * as GitActions from '../Git/actions'
import React from 'react';
import mapShortcutToItems from './utils';

var dividItem = { name: '-' }
var menuBarItems = [
  {
    name: (<div className="menu-bar-item-logo"></div>),
    className: 'coding-logo',
    items: [
      {
        name: 'Settings',
        icon: 'octicon octicon-gear',
        command: 'global:show_settings',
      }
    ]
  }, {
    name: 'File',
    items: [
      {
        name: 'New File',
        icon: 'fa fa-file-o',
        command: 'file:new_file',
        // isDisabled: true
      }, {
        name: 'Save',
        icon: 'fa fa-floppy-o',
        command: 'file:save'
      }
    ]
  }, {
    name: 'Git',
    onOpen: handleGitOnOpen,
    items: [
      {
        name: 'Commit',
        icon: 'octicon octicon-git-commit',
        command: 'git:commit'
      }, {
        name: 'Pull',
        icon: 'octicon octicon-repo-pull',
        command: 'git:pull'
      }, {
        name: 'Push',
        icon: 'octicon octicon-repo-push',
        command: 'git:push'
      }, dividItem,
      {
        name: 'Resolve Conflicts...',
        icon: 'fa',
        command: 'git:resolve_conflicts'
      }, dividItem,
      {
        name: 'Stash Changes...',
        icon: 'fa',
        command: 'git:stash'
      },
      {
        name: 'Unstash Changes...',
        icon: 'fa',
        command: 'git:unstash'
      },
      {
        name: 'Reset HEAD...',
        icon: 'fa',
        command: 'git:reset_head'
      }, dividItem,
      {
        name: 'Branches...',
        icon: 'octicon octicon-git-branch',
        command: 'global:show_branches'
      },
      {
        name: 'Merge Branch...',
        icon: 'octicon octicon-git-merge',
        command: 'git:merge'
      },
      {
        name: 'Tag...',
        icon: 'fa',
        command: 'git:tag'
	  }, dividItem,
      {
        name: 'Rebase...',
        icon: 'fa',
        command: 'git:rebase:start'
      },
      {
        name: 'Abort Rebasing',
        icon: 'fa',
        command: 'git:rebase:abort',
        checkDisable: checkGitRebasing
      },
      {
        name: 'Continue Rebasing',
        icon: 'fa',
        command: 'git:rebase:continue',
        checkDisable: checkGitRebasing
      },
      {
        name: 'Skip Commit',
        icon: 'fa',
        command: 'git:rebase:skip_commit',
        checkDisable: checkGitRebasing
      }
    ]
  }, {
    name: 'Tools',
    items: [
      {
        name: 'Terminal',
        icon: 'octicon octicon-terminal',
        items: [
          {
            name: 'New Terminal',
            icon: 'octicon octicon-terminal',
            command: 'tools:terminal:new_terminal'
          }
        ]
      }
    ]
  }
]

const isRebasing = ['REBASING', 'REBASING_REBASING',
  'REBASING_MERGE', 'REBASING_INTERACTIVE']
function checkGitRebasing (state) {
  return isRebasing.indexOf(state.GitState.rebase.state) == -1
}

function handleGitOnOpen () {
  store.dispatch(GitActions.getRebaseState())
}

export default mapShortcutToItems(menuBarItems)
