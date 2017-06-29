import React from 'react'
import api from 'backendAPI'
import CodingLogo from 'components/CodingLogo'
import mapShortcutToItems from './utils'

const divider = { isDivider: true }
const menuBarItems = [
  {
    key: 'meta',
    name: (<div className='menu-bar-item-logo'><CodingLogo /></div>),
    className: 'coding-logo',
    items: [
      {
        key: 'settings',
        name: 'Settings',
        icon: 'octicon octicon-gear',
        command: 'global:show_settings',
      }
    ]
  }, {
    key: 'file',
    name: 'File',
    items: [
      {
        key: 'newFile',
        name: 'New File',
        icon: 'fa fa-file-o',
        command: 'file:new_file',
      }, {
        key: 'newFolder',
        name: 'New Folder',
        icon: '',
        command: 'file:new_folder'
      }, {
        key: 'save',
        name: 'Save',
        icon: 'fa fa-floppy-o',
        command: 'file:save'
      }
    ]
  }, {
    key: 'git',
    name: 'Git',
    onOpen: handleGitOnOpen,
    items: [
      {
        key: 'commit',
        name: 'Commit',
        icon: 'octicon octicon-git-commit',
        command: 'git:commit'
      }, {
        key: 'pull',
        name: 'Pull',
        icon: 'octicon octicon-repo-pull',
        command: 'git:pull'
      }, {
        key: 'push',
        name: 'Push',
        icon: 'octicon octicon-repo-push',
        command: 'git:push'
      },
      divider,
      {
        key: 'resolveConflicts',
        group: 'conflicts',
        name: 'Resolve Conflicts...',
        command: 'git:resolve_conflicts'
      },
      divider,
      {
        key: 'stash',
        name: 'Stash Changes...',
        command: 'git:stash'
      },
      {
        key: 'unstash',
        name: 'Unstash Changes...',
        command: 'git:unstash'
      },
      {
        key: 'reset',
        name: 'Reset HEAD...',
        command: 'git:reset_head'
      },
      divider,
      {
        key: 'branches',
        name: 'Branches...',
        icon: 'octicon octicon-git-branch',
        command: 'global:show_branches'
      },
      {
        key: 'merge',
        name: 'Merge Branch...',
        icon: 'octicon octicon-git-merge',
        command: 'git:merge'
      },
      {
        key: 'tag',
        name: 'Tag...',
        command: 'git:tag'
      },
      divider,
      {
        key: 'rebase',
        name: 'Rebase...',
        command: 'git:rebase:start'
      },
      {
        key: 'abort',
        name: 'Abort Rebasing',
        command: 'git:rebase:abort',
      },
      {
        key: 'continue',
        name: 'Continue Rebasing',
        command: 'git:rebase:continue',
      },
      {
        key: 'skipCommit',
        name: 'Skip Commit',
        command: 'git:rebase:skip_commit',
      }

    ]
  }, {
    key: 'tools',
    name: 'Tools',
    items: [
      {
        key: 'terminal',
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

function handleGitOnOpen (parentItem) {
  api.gitRebaseState().then(rebaseState => {
    if (isRebasing.indexOf(rebaseState) === -1) {
      // parentItem
    }
  })
}

export default mapShortcutToItems(menuBarItems)
