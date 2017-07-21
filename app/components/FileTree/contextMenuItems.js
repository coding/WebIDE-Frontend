import { gitBlameNode } from './actions'
import { i18n } from 'utils'

const items = [
  {
    name: i18n`fileTree.contextMenu.newFile`,
    icon: '',
    command: 'file:new_file'
  }, {
    name: i18n`fileTree.contextMenu.newFolder`,
    icon: '',
    command: 'file:new_folder'
  }, {
    name: i18n`fileTree.contextMenu.delete`,
    icon: '',
    command: 'file:delete'
  }, {
    name: i18n`fileTree.contextMenu.rename`,
    icon: '',
    command: 'file:rename'
  }, {
    name: i18n`fileTree.contextMenu.delete`,
    icon: '',
    command: 'file:download'
  }, {
    name: i18n`fileTree.contextMenu.upload`,
    icon: '',
    command: () => {
      // reset the files selected from last round
      document.getElementById('filetree-hidden-input-form').reset()
      const input = document.getElementById('filetree-hidden-input')
      input.dispatchEvent(new MouseEvent('click'))
    },
    getIsHidden: ctx => !ctx.isDir
  }, {
    name: i18n`fileTree.contextMenu.gitBlame`,
    icon: '',
    command: (c) => {
      gitBlameNode(c)
    },
  }
]

export default items
