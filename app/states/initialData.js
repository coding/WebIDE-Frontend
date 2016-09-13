var commands = {
  alertNotComplete: function() {}, // {console.log('alertNotComplete');},
  openTerminal: function() {}, // {console.log('openTerminal');},
  toggleAccessUrl: function() {}, // {console.log('toggleAccessUrl');},
  openSettings: function() {}, // {console.log('openSettings');},
  openBranchMenu: function() {}, // {console.log('openBranchMenu');},
  openGitMerge: function() {}, // {console.log('openGitMerge');},
  openGitConflicts: function() {}, // {console.log('openGitConflicts');},
  openStash: function() {}, // {console.log('openStash');},
  openUnstash: function() {}, // {console.log('openUnstash');},
  openRebase: function() {}, // {console.log('openRebase');},
  save: function() {}, // {console.log('save');},
  remove: function() {}, // {console.log('remove');},
  closeTab: function() {}, // {console.log('closeTab');},
  toggleStatusBar: function() {}, // {console.log('toggleStatusBar');},
  toggleFileTree: function() {}, // {console.log('toggleFileTree');},
  pull: function() {}, // {console.log('pull');},
  push: function() {}, // {console.log('push');},
  commit: function() {}, // {console.log('commit');},
  commitAndPush: function() {}, // {console.log('commitAndPush');},
  getFileTreeIcons: function() {}, // {console.log('getFileTreeIcons');},
  getStatusBarIcons: function() {}, // {console.log('getStatusBarIcons');},
  getRebaseState: function() {}, // {console.log('getRebaseState');},
  checkRebaseState: function() {}, // {console.log('checkRebaseState');},
  operateRebase: function() {}, // {console.log('operateRebase');},
  openTag: function() {}, // {console.log('openTag');},
  openReset: function() {}, // {console.log('openReset');},
  clearBuffer: function() {}, // {console.log('clearBuffer');},
  clearScrollbackBuffer: function() {}, // {console.log('clearScrollbackBuffer');},
  resetTerm: function() {}, // {console.log('resetTerm');},
  unsavedList: function() {}, // {console.log('unsavedList');},
  newFile: function() {}, // {console.log('newFile');}
};
var dividItem = { name: '-' };
var menubar = [
  {
    name: '였',
    items: [
      {
        name: 'Settings',
        icon: 'octicon octicon-gear',
        command: commands.openSettings
      }
    ]
  }, {
    name: 'File',
    items: [
      dividItem, {
        name: 'New File',
        icon: 'fa fa-file-o',
        command: commands.newFile
      }, {
        name: 'Save',
        icon: 'fa fa-floppy-o',
        command: commands.save
      }, {
        name: 'Delete',
        icon: 'fa fa-trash-o',
        command: commands.remove
      }, dividItem, {
        name: 'Unsaved Files List',
        icon: 'fa fa-files-o',
        command: commands.unsavedList
      }
    ]
  }, {
    name: 'View',
    items: [
      {
        name: 'Close Current Tab',
        icon: 'fa fa-times-circle-o',
        command: commands.closeTab
      }, {
        name: 'Panels',
        icon: 'fa fa-toggle-on',
        items: [
          {
            name: 'Status Bar',
            icon: ['fa fa-check j-check', 'fa fa-spinner'],
            command: commands.toggleStatusBar,
            getIcons: commands.getStatusBarIcons
          }, {
            name: 'Files Tree Panel',
            icon: ['fa fa-check j-check', 'fa fa-folder-o'],
            command: commands.toggleFileTree,
            getIcons: commands.getFileTreeIcons
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
        command: commands.commit
      }, {
        name: 'Commit And Push...',
        icon: 'octicon octicon-git-commit',
        command: commands.commitAndPush
      }, dividItem, {
        name: 'Pull',
        icon: 'octicon octicon-repo-pull',
        command: commands.pull
      }, {
        name: 'Push',
        icon: 'octicon octicon-repo-push',
        command: commands.push
      }, dividItem, {
        name: 'Branches...',
        icon: 'octicon octicon-git-branch',
        command: commands.openBranchMenu
      }, {
        name: 'Tag...',
        icon: 'octicon',
        command: commands.openTag
      }, {
        name: 'Merge Changes...',
        icon: 'octicon octicon-git-merge',
        command: commands.openGitMerge
      }, dividItem, {
        name: 'Resolve Conflicts...',
        icon: 'octicon',
        command: commands.openGitConflicts
      }, dividItem, {
        name: 'Stash Changes...',
        icon: 'octicon ',
        command: commands.openStash
      }, {
        name: 'Unstash Changes...',
        icon: 'octicon ',
        command: commands.openUnstash
      }, {
        name: 'Reset HEAD...',
        icon: 'octicon ',
        command: commands.openReset
      }, dividItem, {
        name: 'Rebase...',
        icon: 'octicon ',
        command: commands.openRebase
      }, {
        name: 'Abort Rebasing',
        icon: 'octicon ',
        command: commands.operateRebase.bind(null, 'ABORT'),
        checkDisable: commands.checkRebaseState
      }, {
        name: 'Continue Rebasing',
        icon: 'octicon ',
        command: commands.operateRebase.bind(null, 'CONTINUE'),
        checkDisable: commands.checkRebaseState
      }, {
        name: 'Skip Commit in Rebasing',
        icon: 'octicon ',
        command: commands.operateRebase.bind(null, 'SKIP'),
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
            command: commands.openTerminal
          }, {
            name: 'Clear Buffer',
            icon: 'fa fa-eraser',
            command: commands.clearBuffer
          }, {
            name: 'Clear Scrollback Buffer',
            icon: 'fa',
            command: commands.clearScrollbackBuffer
          }, {
            name: 'Reset',
            icon: 'fa',
            command: commands.resetTerm
          }
        ]
      }, {
        name: 'Generate Access Url',
        icon: 'octicon octicon-globe',
        command: commands.toggleAccessUrl
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
];

export const getMenuItems = () => menubar;
