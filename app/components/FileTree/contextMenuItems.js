import { gitBlameNode } from './actions'
import { i18n } from 'utils'

const divider = { isDivider: true }

const items = [
  {
    name: i18n`fileTree.contextMenu.newFile`,
    icon: '',
    command: 'file:new_file',
    id: 'filetree_menu_new_file',
  }, {
    name: i18n`fileTree.contextMenu.newFolder`,
    icon: '',
    command: 'file:new_folder',

  },
  divider,
  {
    name: i18n`fileTree.contextMenu.delete`,
    icon: '',
    command: 'file:delete',
    id: 'filetree_menu_delete',
  }, {
    name: i18n`fileTree.contextMenu.rename`,
    icon: '',
    command: 'file:rename',
  },
  divider,
  {
    name: i18n`fileTree.contextMenu.download`,
    icon: '',
    command: 'file:download'
  },
  {
    name: i18n`fileTree.contextMenu.upload`,
    icon: '',
    command: () => {
      // reset the files selected from last round
      document.getElementById('filetree-hidden-input-form').reset()
      const input = document.getElementById('filetree-hidden-input')
      input.dispatchEvent(new MouseEvent('click'))
    },
    getIsHidden: ctx => !ctx.isDir,

  },
  divider,
  {
    name: i18n`fileTree.contextMenu.gitBlame`,
    icon: '',
    command: (c) => {
      gitBlameNode(c)
    },
    id: 'filetree_menu_gitBlame',
  }
]

export default items
