import { gitBlameNode, syncDirectory, isInVCS } from './actions'
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
    isDivider: true,
    getIsHidden: ctx => !ctx.id
  },
  {
    name: i18n`fileTree.contextMenu.delete`,
    icon: 'fa fa-trash-o',
    command: 'file:delete',
    id: 'filetree_menu_delete',
    getIsHidden: ctx => !ctx.id
  }, {
    name: i18n`fileTree.contextMenu.rename`,
    icon: 'fa',
    command: 'file:rename',
    getIsHidden: ctx => !ctx.id
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
  {
    name: i18n`fileTree.contextMenu.sync`,
    icon: 'fa fa-refresh',
    command: (c) => {
      syncDirectory(c)
    },
    getIsHidden: ctx => !ctx.isDir,
  },
  divider,
  {
    name: i18n`fileTree.contextMenu.ignore`,
    icon: 'fa',
    command: 'file:add_ignore',
    id: 'filetree_menu_ignore'
  }
]

export default items
