/* @flow weak */
import { bindActionCreators } from 'redux'
import store, { getState, dispatch } from '../../store'
import { path as pathUtil } from '../../utils'
import api from '../../backendAPI'
import * as _Modal from '../../components/Modal/actions'
import * as Tab from '../../components/Tab'
import { notify } from '../../components/Notification/actions'

const Modal = bindActionCreators(_Modal, dispatch)

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
  let pathSplitted = node.path.split('/')
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

export default {
  'file:new_file': (c) => {
    const node = c.context
    const path = nodeToNearestDirPath(node)
    const defaultValue = pathUtil.join(path, 'untitled')

    const createFile = createFileWithContent(null)

    Modal.showModal('Prompt', {
      message: 'Enter the path for the new file.',
      defaultValue,
      selectionRange: [path.length, defaultValue.length]
    }).then(createFile)
  },
  'file:new_folder': (c) => {
    const node = c.context
    const path = nodeToNearestDirPath(node)
    const defaultValue = pathUtil.join(path, 'untitled')
    Modal.showModal('Prompt', {
      message: 'Enter the path for the new folder.',
      defaultValue,
      selectionRange: [path.length, defaultValue.length],
    }).then(createFolderAtPath)
  },
  'file:save': (c) => {
    const { TabState } = getState()
    const activeTab = Tab.selectors.getActiveTab(TabState)
    const content = activeTab ? ide.editors[activeTab.id].getValue() : ''

    if (!activeTab.path) {
      const createFile = createFileWithContent(content)
      Modal.showModal('Prompt', {
        message: 'Enter the path for the new file.',
        defaultValue: '/untitled',
        selectionRange: [1, '/untitled'.length]
      })
        .then(createFile)
        .then(path => dispatch(Tab.actions.updateTab({
          id: activeTab.id,
          path,
          title: path.replace(/^.*\/([^\/]+$)/, '$1')
        })))
        .then(() => dispatch(Tab.actions.updateTabFlags(activeTab.id, 'modified', false)))
    } else {
      api.writeFile(activeTab.path, content)
        .then(() => {
          dispatch(Tab.actions.updateTabFlags(activeTab.id, 'modified', false))
          dispatch(Tab.actions.updateTab({
            id: activeTab.id, content: { body: content }
          }))
        })
    }
  },


  'file:rename': (c) => {
    let node = c.context
    let parentPath = nodeToParentDirPath(node)

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
      message: 'Enter the new name (or new path) for this file.',
      defaultValue: node.path,
      selectionRange: [parentPath.length, node.path.length]
    }).then(newPath => moveFile(node.path, newPath))
  },


  'file:delete': async (c) => {
    let confirmed = await Modal.showModal('Confirm', {
      header: 'Are you sure you want to delete this file?',
      message: `You're trying to delete ${c.context.path}`,
      okText: 'Delete'
    })

    if (confirmed) {
      api.deleteFile(c.context.path)
        .then(() => dispatch(notify({ message: 'Delete success!' })))
        .catch(err =>
          dispatch(notify({ message: `Delete fail: ${err.msg}` }))
        )
    }

    Modal.dismissModal()
  },


  'file:download': c => {
    api.downloadFile(c.context.path, c.context.isDir)
  }
  // 'file:unsaved_files_list':
}
