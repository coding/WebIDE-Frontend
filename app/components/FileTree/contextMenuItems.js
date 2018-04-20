import { gitBlameNode } from './actions'
import i18n from 'utils/createI18n'

const divider = { isDivider: true }

const items = [
  {
    name: i18n`fileTree.contextMenu.newFile`,
    icon: 'fa fa-file-text-o',
    command: 'file:new_file',
    id: 'filetree_menu_new_file',
  },
  {
    name: i18n`fileTree.contextMenu.newFolder`,
    icon: 'fa fa-folder-o',
    command: 'file:new_folder',

  },
  {
    name: i18n`fileTree.contextMenu.generateUnitTest`,
    icon: 'fa fa-file-code-o',
    command: 'file:generate_unit_test',
  },
  {
    name: i18n`fileTree.contextMenu.runUnitTest`,
    icon: 'fa fa-bug',
    command: 'file:run_unit_test',
  },
  divider,
  {
    name: i18n`fileTree.contextMenu.delete`,
    icon: 'fa fa-trash-o',
    command: 'file:delete',
    id: 'filetree_menu_delete',
  },
  {
    name: i18n`fileTree.contextMenu.rename`,
    icon: 'fa',
    command: 'file:rename',
  },
  divider,
  {
    name: i18n`fileTree.contextMenu.download`,
    icon: 'fa fa-download',
    command: 'file:download'
  },
  {
    name: i18n`fileTree.contextMenu.upload`,
    icon: 'fa fa-upload',
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
    icon: 'fa',
    command: (c) => {
      gitBlameNode(c)
    },
    id: 'filetree_menu_gitBlame',
  }
]

export default items
