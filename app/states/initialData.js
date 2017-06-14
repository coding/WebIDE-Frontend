const commands = {
  alertNotComplete () {}, // {console.log('alertNotComplete');},
  openTerminal () {}, // {console.log('openTerminal');},
  toggleAccessUrl () {}, // {console.log('toggleAccessUrl');},
  openSettings () {}, // {console.log('openSettings');},
  openBranchMenu () {}, // {console.log('openBranchMenu');},
  openGitMerge () {}, // {console.log('openGitMerge');},
  openGitConflicts () {}, // {console.log('openGitConflicts');},
  openStash () {}, // {console.log('openStash');},
  openUnstash () {}, // {console.log('openUnstash');},
  openRebase () {}, // {console.log('openRebase');},
  save () {}, // {console.log('save');},
  remove () {}, // {console.log('remove');},
  closeTab () {}, // {console.log('closeTab');},
  toggleStatusBar () {}, // {console.log('toggleStatusBar');},
  toggleFileTree () {}, // {console.log('toggleFileTree');},
  pull () {}, // {console.log('pull');},
  push () {}, // {console.log('push');},
  commit () {}, // {console.log('commit');},
  commitAndPush () {}, // {console.log('commitAndPush');},
  getFileTreeIcons () {}, // {console.log('getFileTreeIcons');},
  getStatusBarIcons () {}, // {console.log('getStatusBarIcons');},
  getRebaseState () {}, // {console.log('getRebaseState');},
  checkRebaseState () {}, // {console.log('checkRebaseState');},
  operateRebase () {}, // {console.log('operateRebase');},
  openTag () {}, // {console.log('openTag');},
  openReset () {}, // {console.log('openReset');},
  clearBuffer () {}, // {console.log('clearBuffer');},
  clearScrollbackBuffer () {}, // {console.log('clearScrollbackBuffer');},
  resetTerm () {}, // {console.log('resetTerm');},
  unsavedList () {}, // {console.log('unsavedList');},
  newFile () {} // {console.log('newFile');}
}
const dividItem = { name: '-' }
const menubar = [
  {
    name: '였',
    items: [
      {
        name: 'Settings',
        icon: 'octicon octicon-gear',
        command: 'app:settings'
      }
    ]
  }, {
    name: 'File',
    items: [
      {
        name: 'New File',
        icon: 'fa fa-file-o',
        command: 'file:new_file'
      }, {
        name: 'Save',
        icon: 'fa fa-floppy-o',
        shortcut: '⌘S',
        command: 'file:save'
      }, {
        name: 'Delete',
        icon: 'fa fa-trash-o',
        command: 'file:delete'
      }, dividItem, {
        name: 'Unsaved Files List',
        icon: 'fa fa-files-o',
        command: 'file:unsaved_files_list'
      }
    ]
  }, {
    name: 'View',
    items: [
      {
        name: 'Close Current Tab',
        icon: 'fa fa-times-circle-o',
        command: 'view:close_tab'
      }, {
        name: 'Panels',
        icon: 'fa fa-toggle-on',
        items: [
          {
            name: 'Status Bar',
            icon: ['fa fa-check j-check', 'fa fa-spinner'],
            command: 'view:toggle_statusbar'
          }, {
            name: 'Files Tree Panel',
            icon: ['fa fa-check j-check', 'fa fa-folder-o'],
            command: 'view:toggle_filetree'

          }
        ]
      }
    ]
  }, {
    name: 'Repository',
    onOpen: commands.getRebaseState,
    items: [
      {
        name: 'Commit',
        icon: 'octicon octicon-git-commit',
        command: 'git:commit'
      }, {
        name: 'Commit And Push...',
        icon: 'octicon octicon-git-commit',
        command: 'git:commit_and_push'
      }, dividItem, {
        name: 'Pull',
        icon: 'octicon octicon-repo-pull',
        command: 'git:pull'
      }, {
        name: 'Push',
        icon: 'octicon octicon-repo-push',
        command: 'git:push'
      }, dividItem, {
        name: 'Branches...',
        icon: 'octicon octicon-git-branch',
        command: 'git:branch'
      }, {
        name: 'Tag...',
        icon: 'octicon',
        command: 'git:tag'
      }, {
        name: 'Merge Branches...',
        icon: 'octicon octicon-git-merge',
        command: 'git:merge'
      }, dividItem, {
        name: 'Resolve Conflicts...',
        icon: 'octicon',
        command: 'git:resolve_conflicts'
      }, dividItem, {
        name: 'Stash Changes...',
        icon: 'octicon ',
        command: 'git:stash'
      }, {
        name: 'Unstash Changes...',
        icon: 'octicon ',
        command: 'git:unstash'
      }, {
        name: 'Reset HEAD...',
        icon: 'octicon ',
        command: 'git:reset_head'
      }, dividItem, {
        name: 'Rebase...',
        icon: 'octicon ',
        command: 'git:rebase:start'
      }, {
        name: 'Abort Rebasing',
        icon: 'octicon ',
        command: 'git:rebase:abort',
        checkDisable: commands.checkRebaseState
      }, {
        name: 'Continue Rebasing',
        icon: 'octicon ',
        command: 'git:rebase:continue',
        checkDisable: commands.checkRebaseState
      }, {
        name: 'Skip Commit in Rebasing',
        icon: 'octicon ',
        command: 'git:rebase:skip_commit',
        checkDisable: commands.checkRebaseState
      }
    ]
  }, {
    name: 'Tools',
    items: [
      {
        name: 'Terminal Tools',
        icon: 'octicon octicon-terminal',
        items: [
          {
            name: 'New Terminal',
            icon: 'octicon octicon-terminal',
            command: 'tools:terminal:new_terminal'
          }, {
            name: 'Clear Buffer',
            icon: 'fa fa-eraser',
            command: 'tools:terminal:clear_buffer'
          }, {
            name: 'Clear Scrollback Buffer',
            icon: 'fa',
            command: 'tools:terminal:clear_scrollback_buffer'
          }, {
            name: 'Reset',
            icon: 'fa',
            command: 'tools:terminal:reset'
          }
        ]
      }
    ]
  }, {
    name: 'Help',
    items: [
      {
        name: 'Document',
        href: 'https://coding.net/help/doc/webide/',
        icon: 'fa fa-book'
      }, {
        name: 'Send Feedback',
        href: 'https://coding.net/u/coding/p/Coding-Feedback/topic/tag/241717',
        icon: 'fa fa-envelope-o'
      }
    ]
  }
]

export const getMenuItems = () => menubar
