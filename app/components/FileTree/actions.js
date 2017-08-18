import _ from 'lodash'
import api from 'backendAPI'
import { registerAction } from 'utils/actions'
import FileStore from 'commons/File/store'
import * as TabActions from 'components/Tab/actions'
import * as Modal from 'components/Modal/actions'
import contextMenuStore from 'components/ContextMenu/store'
import state, { FileTreeNode } from './state'
import bindToFile from './fileTreeToFileBinding'
import FileTreeContextMenuItems from './contextMenuItems'
import dispatchCommand from 'commands/dispatchCommand'
import { getTabType } from 'utils'
import i18n from 'utils/createI18n'

export const initializeFileTree = registerAction('filetree:init', () => {
  FileStore.fetchProjectRoot()
  const FileState = FileStore.getState()
  bindToFile(state, FileState, FileTreeNode)
})

export const selectNode = registerAction('filetree:select_node',
  (node, multiSelect) => ({ node, multiSelect }),
  ({ node, multiSelect }) => {
    const offset = node
    if (typeof offset === 'number') {
      node = undefined

      if (offset === 1) {
        const curNode = state.focusedNodes[state.focusedNodes.length - 1]
        if (curNode) node = curNode.getNext
      } else if (offset === -1) {
        const curNode = state.focusedNodes[0]
        if (curNode) node = curNode.getPrev
      }

      if (!node || node.isShadowRoot) node = state.root
    }

    if (!multiSelect) {
      state.root.unfocus()
      state.root.forEachDescendant(childNode => childNode.unfocus())
    }

    node.focus()
  }
)

export const highlightDirNode = registerAction('filetree:highlight_dir_node',
  node => node.isDir && node.highlight()
)

export const unhighlightDirNode = registerAction('filetree:unhighlight_dir_node',
  node => node.isDir && node.unhighlight()
)

export const toggleNodeFold = registerAction('filetree:toggle_node_fold',
  (node, shouldBeFolded, deep) => ({ node, shouldBeFolded, deep }),
  ({ node, shouldBeFolded = null, deep = false }) => {
    if (!node.isDir) return
    const isFolded = _.isBoolean(shouldBeFolded) ? shouldBeFolded : !node.isFolded
    node.toggleFold(isFolded)
    if (deep) {
      node.forEachDescendant((childNode) => {
        childNode.toggleFold(isFolded)
      })
    }
  }
)

export const removeNode = registerAction('filetree:remove_node', (node) => {
  state.entities.delete(node.id || node.path)
})

export const openContextMenu = contextMenuStore.openContextMenuFactory(FileTreeContextMenuItems)
export const closeContextMenu = contextMenuStore.closeContextMenu

const openNodeCommonLogic = function (node, editor, shouldBeFolded = null, deep = false) {
  if (node.isDir) {
    if (!node.children.length) {
      api.fetchPath(node.path)
        .then(data => FileStore.loadNodeData(data))
        .then(() => toggleNodeFold(node, shouldBeFolded, deep))
    } else {
      toggleNodeFold(node, shouldBeFolded, deep)
    }
  } else if (getTabType(node) === 'TEXT') {
    dispatchCommand('file:open_file', { path: node.path, editor })
  } else {
    TabActions.createTab({
      title: node.name,
      icon: 'fa fa-file-text-o',
      editor: {
        ...editor,
        filePath: node.path,
      },
    })
  }
}
export const openNode = registerAction('filetree:open_node',
  (node, shouldBeFolded, deep) => ({ node, shouldBeFolded, deep }),
  ({ node, shouldBeFolded = null, deep = false }) => {
    openNodeCommonLogic(node, {}, shouldBeFolded, deep)
  }
)

export const gitBlameNode = registerAction('filetree:git_blame', (node) => {
  api.gitBlame(node.path).then((gitBlameData) => {
    openNodeCommonLogic(node, { gitBlame: { show: true, data: gitBlameData } })
  })
})

export const uploadFilesToPath = (files, path) => {
  if (!files.length) return
  const node = state.entities.get(path)
  const targetDirPath = node.isDir ? node.path : (node.parent.path || '/')
  _(files).forEach((file) => {
    api.uploadFile(targetDirPath, file, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        // updateUploadProgress(percentCompleted)
        // if (percentCompleted === 100) {
        //   setTimeout(() => updateUploadProgress(''), 3000)
        // }
      }
    })
  })
}

export const mv = (from, to, force=false) => {
  const name = from.split('/').pop()
  const newPath = `${to}/${name}`
  if (from === newPath) return
  api.moveFile(from, newPath, force).then(async (res) => {
    if (res.code && res.code !== 0) {
      if (res.msg && res.msg.indexOf('force') !== -1) {
        const confirmed = await Modal.showModal('Confirm', {
          header: i18n`file.fileExist`,
          message: i18n`file.fileForceMove`,
          okText: i18n`file.overwriteButton`
        })
        if (confirmed) {
          mv(from, to, true)
        }
        Modal.dismissModal()
      } else if (/directory.*exist/.test(res.msg)) {
        await Modal.showModal('Alert', {
          header: i18n`file.moveFolderFailed`,
          message: i18n`file.folderExist`,
        })
        Modal.dismissModal()
      }
    }
  })
}
