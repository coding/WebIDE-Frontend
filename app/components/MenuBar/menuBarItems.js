/* @flow weak */
var dividItem = { name: '-' }
var menuBarItems = [
  {
    name: '',
    className: 'coding-logo',
    items: [
      {
        name: 'Settings',
        icon: 'octicon octicon-gear',
        command: 'app:settings',
        isDisabled: true
      }
    ]
  }, {
    name: 'File',
    items: [
      {
        name: 'New File',
        icon: 'fa fa-file-o',
        shortcut: '⎇N',
        command: 'file:new_file',
        // isDisabled: true
      }, {
        name: 'Save',
        icon: 'fa fa-floppy-o',
        shortcut: '⌘S',
        command: 'file:save'
      }
    ]
  }, {
    name: 'Git',
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
        name: 'Merge Branch...',
        icon: 'fa',
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
        name: 'About Rebasing',
        icon: 'fa',
        command: 'git:unstash',
        checkDisable: () => {
          return true;
        }
      },
      {
        name: 'Continue Rebasing',
        icon: 'fa',
        command: 'git:reset_head',
        checkDisable: () => {
          return true;
        }
      },
      {
        name: 'Skip Commit',
        icon: 'fa',
        command: 'git:reset_head',
        checkDisable: () => {
          return true;
        }
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

export default menuBarItems
