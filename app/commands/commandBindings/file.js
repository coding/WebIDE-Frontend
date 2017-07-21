import uniqueId from 'lodash/uniqueId'
import { bindActionCreators } from 'redux'
import store, { getState, dispatch } from '../../store'
import mobxStore from '../../mobxStore'
import { path as pathUtil } from '../../utils'
import api from '../../backendAPI'
import * as Modal from '../../components/Modal/actions'
import TabStore from 'components/Tab/store'
import FileTreeStore from 'components/FileTree/store'
import FileStore from 'commons/File/store'
import { notify } from '../../components/Notification/actions'
import i18n from 'utils/createI18n'


const nodeToNearestDirPath = (node) => {
  if (!node) node = { isDir: true, path: '/' } // fake a root node if !node
  if (node.isDir) {
    var path = node.path
  } else {
    var path = node.parent.path
  }
  if (path != '/') path += '/'
  return path
}

const nodeToParentDirPath = (node) => {
  const pathSplitted = node.path.split('/')
  if (pathSplitted.pop() == '') { pathSplitted.pop() }
  return `${pathSplitted.join('/')}/`
}

function createFileWithContent (content) {
  return function createFileAtPath (path) {
    return api.createFile(path, content)
      .then(() => { if (content) api.writeFile(path, content) })
      .then(Modal.dismissModal)
      .then(() => path)
      // if error, try again.
      .catch(err =>
        Modal.updateModal({ statusMessage: err.msg }).then(createFileAtPath)
      )
  }
}

function createFolderAtPath (path) {
  return api.createFolder(path)
  .then(Modal.dismissModal)
  .then(() => path)
    // if error, try again.
  .catch(err =>
    Modal.updateModal({ statusMessage: err.msg }).then(createFolderAtPath)
  )
}

function openTabOfNewFile (path) {
  TabStore.createTab({
    title: path.split('/').pop(),
    editor: {
      filePath: path,
    }
  })
}

export default {
  'file:new_file': (c) => {
    const node = c.context
    const path = nodeToNearestDirPath(node)
    const defaultValue = pathUtil.join(path, 'untitled')

    const createFile = createFileWithContent(null)

    Modal.showModal('Prompt', {
      message: i18n`file.newFilePath`,
      defaultValue,
      selectionRange: [path.length, defaultValue.length]
    })
    .then(createFile)
    .then(openTabOfNewFile)
  },
  'file:new_folder': (c) => {
    const node = c.context
    const path = nodeToNearestDirPath(node)
    const defaultValue = pathUtil.join(path, 'untitled')
    Modal.showModal('Prompt', {
      message: i18n`file.newFileFolderPath`,
      defaultValue,
      selectionRange: [path.length, defaultValue.length],
    }).then(createFolderAtPath)
  },
  'file:save': (c) => {
    const { EditorTabState } = mobxStore
    const activeTab = EditorTabState.activeTab
    const content = activeTab ? activeTab.editor.cm.getValue() : ''

    if (!activeTab.file) {
      const createFile = createFileWithContent(content)
      Modal.showModal('Prompt', {
        message: i18n`file.newFilePath`,
        defaultValue: '/untitled',
        selectionRange: [1, '/untitled'.length]
      })
        .then(createFile)
        .then(path => TabStore.updateTab({
          id: activeTab.id,
          title: path.replace(/^.*\/([^\/]+$)/, '$1'),
          editor: { filePath: path },
        }))
        .then(() => TabStore.updateTabFlags(activeTab.id, 'modified', false))
    } else {
      api.writeFile(activeTab.file.path, content)
        .then(() => {
          TabStore.updateTabFlags(activeTab.id, 'modified', false)
          FileStore.updateFile({
            path: activeTab.file.path,
            content,
          })
        })
    }
  },


  'file:rename': (c) => {
    const node = c.context
    const parentPath = nodeToParentDirPath(node)

    const moveFile = (from, newPath, force) => {
      api.moveFile(node.path, newPath, force)
        .then(() => Modal.dismissModal())
        .catch(err =>
          Modal.updateModal({ statusMessage: err.msg })
          .then((newPath, force) =>
            moveFile(from, newPath, force)
          )
        )
    }

    Modal.showModal('Prompt', {
      message: i18n`file.newFileName`,
      defaultValue: node.path,
      selectionRange: [parentPath.length, node.path.length]
    }).then(newPath => moveFile(node.path, newPath))
  },


  'file:delete': async (c) => {
    const confirmed = await Modal.showModal('Confirm', {
      header: i18n`file.deleteHeader`,
      message: i18n`file.deleteMessage${{ file: c.context.path }}`,
      okText: i18n`file.deleteButton`
    })

    if (confirmed) {
      api.deleteFile(c.context.path)
        .then(() => notify({ message: i18n`file.deleteNotifySuccess` }))
        .catch(err =>
          notify({ message: i18n`file.deleteNotifyFailed${err.msg}` })
        )
    }

    Modal.dismissModal()
  },

  'file:download': (c) => {
    api.downloadFile(c.context.path, c.context.isDir)
  },

  // 'file:unsaved_files_list':
}
