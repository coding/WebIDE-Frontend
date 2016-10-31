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
        isDisabled: true
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
