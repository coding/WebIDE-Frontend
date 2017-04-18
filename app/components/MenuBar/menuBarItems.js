/* @flow weak */
import store from '../../store.js'
import * as GitActions from '../Git/actions'
import React from 'react'
import mapShortcutToItems from './utils'

var codingLogo = (
  <div className='menu-bar-item-logo'>
    <svg
      version='1.1'
      id='Layer_3'
      xmlns='http://www.w3.org/2000/svg'
      x='0px'
      y='0px'
      width='407.5px'
      height='306.577px'
      viewBox='0 0 407.5 306.577'
      enableBackground='new 0 0 407.5 306.577'
    >
      <g>
        <ellipse cx='159.785' cy='167.517' rx='3.656' ry='4.39' />
        <ellipse cx='246.618' cy='167.517' rx='3.656' ry='4.39' />
        <path d='M299.252,139.319c-5.997,0-11.253,3.803-14.191,9.509c-9.997-21.679-30.795-41.764-56.498-50.035
          c-13.869-5.534-23.608-16.155-24.812-28.568c-1.204,12.413-10.943,23.034-24.812,28.568c-25.703,8.271-46.501,28.355-56.498,50.035
          c-2.938-5.706-8.194-9.509-14.191-9.509c-9.21,0-16.676,8.965-16.676,20.025c0,11.059,7.466,20.025,16.676,20.025
          c2.801,0,5.439-0.833,7.757-2.299c0.793,35.91,39.753,59.219,87.745,59.282c47.991-0.062,86.952-23.372,87.745-59.282
          c2.318,1.466,4.956,2.299,7.757,2.299c9.21,0,16.676-8.965,16.676-20.025C315.928,148.285,308.461,139.319,299.252,139.319z
          M115.83,165.602c-0.78,2.883-4.253,4.111-7.757,2.744c-3.504-1.367-5.712-4.812-4.932-7.695c0.78-2.883,4.253-4.111,7.757-2.744
          S116.61,162.72,115.83,165.602z M203.75,226.356c-38.492-0.06-69.664-18.201-69.664-44.17c0-0.544,0.02-1.083,0.046-1.621
          c0.009-0.177,0.018-0.354,0.03-0.531c0.024-0.367,0.057-0.732,0.093-1.097c0.049-0.489,0.107-0.976,0.178-1.46
          c0.007-0.048,0.013-0.096,0.02-0.144c0.775-5.104,2.759-12.893,5.755-17.382c7.198-10.412,20.037-17.348,34.684-17.348
          c11.276,0,21.473,4.118,28.858,10.759c7.385-6.641,17.582-10.759,28.858-10.759c14.647,0,27.486,6.937,34.684,17.348
          c2.996,4.489,4.98,12.278,5.755,17.382c0.007,0.048,0.013,0.096,0.02,0.144c0.072,0.484,0.129,0.972,0.178,1.46
          c0.036,0.365,0.069,0.729,0.093,1.097c0.012,0.177,0.021,0.354,0.03,0.531c0.026,0.538,0.046,1.077,0.046,1.621
          C273.414,208.155,242.242,226.295,203.75,226.356z M299.427,168.346c-3.504,1.367-6.977,0.139-7.757-2.744s1.428-6.328,4.932-7.695
          c3.504-1.367,6.977-0.139,7.757,2.744C305.139,163.534,302.931,166.979,299.427,168.346z'
        />
      </g>
    </svg>
  </div>
)
var dividItem = { name: '-' }
var menuBarItems = [
  {
    name: codingLogo,
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
        name: 'New Folder',
        icon: '',
        command: 'file:new_folder'
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
