/* @flow weak */
var commands = {
  alertNotComplete: function () {}, // {console.log('alertNotComplete');},
  openTerminal: function () {}, // {console.log('openTerminal');},
  toggleAccessUrl: function () {}, // {console.log('toggleAccessUrl');},
  openSettings: function () {}, // {console.log('openSettings');},
  openBranchMenu: function () {}, // {console.log('openBranchMenu');},
  openGitMerge: function () {}, // {console.log('openGitMerge');},
  openGitConflicts: function () {}, // {console.log('openGitConflicts');},
  openStash: function () {}, // {console.log('openStash');},
  openUnstash: function () {}, // {console.log('openUnstash');},
  openRebase: function () {}, // {console.log('openRebase');},
  save: function () {}, // {console.log('save');},
  remove: function () {}, // {console.log('remove');},
  closeTab: function () {}, // {console.log('closeTab');},
  toggleStatusBar: function () {}, // {console.log('toggleStatusBar');},
  toggleFileTree: function () {}, // {console.log('toggleFileTree');},
  pull: function () {}, // {console.log('pull');},
  push: function () {}, // {console.log('push');},
  commit: function () {}, // {console.log('commit');},
  commitAndPush: function () {}, // {console.log('commitAndPush');},
  getFileTreeIcons: function () {}, // {console.log('getFileTreeIcons');},
  getStatusBarIcons: function () {}, // {console.log('getStatusBarIcons');},
  getRebaseState: function () {}, // {console.log('getRebaseState');},
  checkRebaseState: function () {}, // {console.log('checkRebaseState');},
  operateRebase: function () {}, // {console.log('operateRebase');},
  openTag: function () {}, // {console.log('openTag');},
  openReset: function () {}, // {console.log('openReset');},
  clearBuffer: function () {}, // {console.log('clearBuffer');},
  clearScrollbackBuffer: function () {}, // {console.log('clearScrollbackBuffer');},
  resetTerm: function () {}, // {console.log('resetTerm');},
  unsavedList: function () {}, // {console.log('unsavedList');},
  newFile: function () {} // {console.log('newFile');}
}
var dividItem = { name: '-' }
var menubar = [
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
        name: 'Merge Changes...',
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
