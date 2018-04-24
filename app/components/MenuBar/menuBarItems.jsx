import React from 'react'
import api from 'backendAPI'
import i18n from '../../utils/createI18n'
import { observable } from 'mobx'

const divider = { isDivider: true }
const menuBarItems = observable([
  {
    key: 'meta',
    name: (<div className='menu-bar-item-logo' ></div>),
    className: 'coding-logo',
    items: [
      {
        key: 'settings',
        name: i18n`menuBarItems.meta.main`,
        icon: 'octicon octicon-gear',
        command: 'global:show_settings',
        canopen: true
      }
    ]
  }, {
    key: 'file',
    name: i18n`menuBarItems.file.main`,
    items: [
      {
        key: 'newFile',
        name: i18n`menuBarItems.file.newFile`,
        icon: 'fa fa-file-text-o',
        command: 'file:new_file',
        showMore: true
      }, {
        key: 'newFolder',
        name: i18n`menuBarItems.file.newFolder`,
        icon: 'fa fa-folder-o',
        command: 'file:new_folder',
        showMore: true
      }, {
        key: 'save',
        name: i18n`menuBarItems.file.save`,
        icon: 'fa fa-floppy-o',
        command: 'file:save'
      }
    ]
  }, {
    key: 'edit',
    name: i18n`menuBarItems.edit.main`,
    items: [
      {
        key: 'format',
        name: i18n`menuBarItems.edit.format`,
        icon: '',
        command: 'edit:toggle_format',
      }, {
        key: 'comment',
        name: i18n`menuBarItems.edit.comment`,
        icon: '',
        command: 'edit:toggle_comment',
      }
    ]
  }, {
    key: 'git',
    name: i18n`menuBarItems.git.main`,
    onOpen: onGitMenuOpen,
    items: [
      {
        key: 'commit',
        name: i18n`menuBarItems.git.commit`,
        icon: 'octicon octicon-git-commit',
        command: 'git:commit',
        showMore: true,
      }, {
        key: 'pull',
        name: i18n`menuBarItems.git.pull`,
        icon: 'octicon octicon-repo-pull',
        command: 'git:pull'
      }, {
        key: 'push',
        name: i18n`menuBarItems.git.push`,
        icon: 'octicon octicon-repo-push',
        command: 'git:push'
      },
      divider,
      {
        key: 'resolveConflicts',
        group: 'conflicts',
        name: i18n`menuBarItems.git.resolveConflicts`,
        command: 'git:resolve_conflicts',
        showMore: true
      },
      divider,
      {
        key: 'stash',
        name: i18n`menuBarItems.git.stashChanges`,
        command: 'git:stash',
        showMore: true,
      },
      {
        key: 'unstash',
        name: i18n`menuBarItems.git.unstashChanges`,
        command: 'git:unstash',
        showMore: true
      },
      {
        key: 'reset',
        name: i18n`menuBarItems.git.resetHead`,
        command: 'git:reset_head',
        showMore: true
      },
      divider,
      {
        key: 'branches',
        name: i18n`menuBarItems.git.branches`,
        icon: 'octicon octicon-git-branch',
        command: 'global:show_branches',
        showMore: true
      },
      {
        key: 'merge',
        name: i18n`menuBarItems.git.mergeBranch`,
        icon: 'octicon octicon-git-merge',
        command: 'git:merge',
        showMore: true
      },
      {
        key: 'tag',
        name: i18n`menuBarItems.git.tag`,
        command: 'git:tag',
        showMore: true
      },
      divider,
      {
        key: 'rebase',
        name: i18n`menuBarItems.git.rebase`,
        command: 'git:rebase:start',
        showMore: true
      },
      {
        key: 'abort',
        name: i18n`menuBarItems.git.abortRebase`,
        command: 'git:rebase:abort',
        getIsDisabled,
      },
      {
        key: 'continue',
        name: i18n`menuBarItems.git.continueRebase`,
        command: 'git:rebase:continue',
        getIsDisabled,
      },
      {
        key: 'skipCommit',
        name: i18n`menuBarItems.git.skipCommit`,
        command: 'git:rebase:skip_commit',
        showMore: true,
        getIsDisabled,
      }
    ]
  }, {
    key: 'tools',
    name: i18n`menuBarItems.tools.main`,
    items: [
      {
        key: 'terminal',
        name: i18n`menuBarItems.tools.terminal`,
        icon: 'octicon octicon-terminal',
        items: [
          {
            name: i18n`menuBarItems.tools.newTerminal`,
            icon: 'octicon octicon-terminal',
            command: 'tools:terminal:new_terminal'
          }
        ]
      }, {
        key: 'package',
        name: i18n`menuBarItems.tools.package`,
        command: 'tools:package'
      }, {
        key: 'pluginUpload',
        name: i18n`menuBarItems.tools.pluginUpload`,
        command: 'tools:pluginUpload'
      }
    ]
  }
])

const isRebasing = ['REBASING', 'REBASING_REBASING',
  'REBASING_MERGE', 'REBASING_INTERACTIVE']

function onGitMenuOpen () {
  return api.gitRebaseState().then(rebaseState => ({ rebaseState }))
}

function getIsDisabled (menuContext) {
  return (isRebasing.indexOf(menuContext.rebaseState) === -1)
}
export default menuBarItems
