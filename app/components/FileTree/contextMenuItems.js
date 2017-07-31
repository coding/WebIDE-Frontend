import { gitBlameNode } from './actions'
import { i18n } from 'utils'

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
    id: 'filetree_menu_new_folder',
  }, {
    name: i18n`fileTree.contextMenu.delete`,
    icon: '',
    command: 'file:delete',
    id: 'filetree_menu_delete',
  }, {
    name: i18n`fileTree.contextMenu.rename`,
    icon: '',
    command: 'file:rename',
    id: 'filetree_menu_rename',
  }, {
    name: i18n`fileTree.contextMenu.delete`,
    icon: '',
    command: 'file:download',
    id: 'filetree_menu_download',
  }, {
    name: i18n`fileTree.contextMenu.upload`,
    icon: '',
    command: () => {
      // reset the files selected from last round
      document.getElementById('filetree-hidden-input-form').reset()
      const input = document.getElementById('filetree-hidden-input')
      input.dispatchEvent(new MouseEvent('click'))
    },
    getIsHidden: ctx => !ctx.isDir,
    id: 'filetree_menu_upload',
  }, {
    name: i18n`fileTree.contextMenu.gitBlame`,
    icon: '',
    command: (c) => {
      gitBlameNode(c)
    },
    id: 'filetree_menu_gitBlame',
  }
]

export default items
