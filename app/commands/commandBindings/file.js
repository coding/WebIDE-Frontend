import mobxStore from '../../mobxStore'
import { path as pathUtil } from '../../utils'
import api from '../../backendAPI'
import * as Modal from '../../components/Modal/actions'
import TabStore from 'components/Tab/store'
import FileState from 'commons/File/state'
import FileStore from 'commons/File/store'
import { notify } from '../../components/Notification/actions'
import i18n from 'utils/createI18n'
import icons from 'file-icons-js'
import { toJS, when } from 'mobx'

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
    if (content) {
      return api.writeFile(path, content)
        .then(Modal.dismissModal)
        .then(() => path)
        .catch(err =>
          Modal.updateModal({ statusMessage: err.msg }).then(createFileAtPath)
        )
    }
    return api.createFile(path, content)
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
  .then((data) => {
    if (data.code < 0) {
      Modal.updateModal({ statusMessage: data.msg }).then(createFolderAtPath)
    } else {
      Modal.dismissModal()
    }
  })
  .then(() => path)
    // if error, try again.
  .catch(err =>
    Modal.updateModal({ statusMessage: err.msg }).then(createFolderAtPath)
  )
}


export function openFile (obj) {
  // 做一些encoding的调度
  if (!FileState.initData.size) {
    when(() => FileState.initData.size && FileState.initData.get(obj.path), () => {
      const { encoding } = FileState.initData.get(obj.path) || {}
      openFileWithEncoding({ ...obj, encoding })
      FileState.initData.delete(obj.path)
    })
  } else {
    const { encoding } = FileState.initData.get(obj.path) || {}
    openFileWithEncoding({ ...obj, encoding })
    FileState.initData.delete(obj.path)
  }
}

export function openFileWithEncoding ({ path, editor = {}, others = {}, allGroup = false, encoding }) {
  const { encoding: currentEncoding } = FileStore.get(path) || {}
  return api.readFile(path, encoding || currentEncoding)
    .then((data) => {
      FileStore.loadNodeData(data)
      return data
    })
    .then(() => {
      const activeTabGroup = TabStore.getState().activeTabGroup
      const existingTabs = TabStore.findTab(
        tab => tab.file && tab.file.path === path && (tab.tabGroup === activeTabGroup || allGroup)
      )
      if (existingTabs.length) {
        const existingTab = existingTabs[0]
        existingTab.activate()
      } else {
        TabStore.createTab({
          icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
          editor: {
            ...editor,
            filePath: path,
          },
          ...others
        })
      }
    })
}

const fileCommands = {
  'file:open_file': (c) => { // 在当前 tabgroup 中优先打开已有的 tab
    if (typeof c.data === 'string') {
      openFile({ path: c.data })
    } else {
      openFile(c.data)
    }
  },
  'file:open_exist_file': (c) => { // 在所有 tabgroup 中优先打开已有的 tab
    if (typeof c.data === 'string') {
      openFile({ path: c.data, allGroup: true })
    } else {
      openFile(c.data)
    }
  },
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
    .then(path => openFile({ path }))
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
      const defaultPath = activeTab._title ? `/${activeTab._title}` : '/untitled'
      Modal.showModal('Prompt', {
        message: i18n`file.newFilePath`,
        defaultValue: defaultPath,
        selectionRange: [1, defaultPath.length]
      })
        .then(createFile)
        .then((path) => {
          api.readFile(path).then((data) => {
            FileStore.loadNodeData(data)
            TabStore.updateTab({
              icon: (path && icons.getClassWithColor(path.split('/').pop())) || 'fa fa-file-text-o',
              id: activeTab.id,
              editor: { filePath: path },
            })
          })
        })
    } else {
      api.writeFile(activeTab.file.path, content)
        .then((res) => {
          FileStore.updateFile({
            path: activeTab.file.path,
            isSynced: true,
            lastModified: res.lastModified,
            content,
          })
        })
    }
  },


  'file:rename': (c) => {
    const node = c.context
    const oldPath = node.path
    const parentPath = nodeToParentDirPath(node)
    const existingTabs = TabStore.findTab(
      tab => tab.file && tab.file.path.startsWith(oldPath)
    )

    const moveFile = (from, to, force) => {
      api.moveFile(from, to, force)
        .then(() => Modal.dismissModal())
        .catch(err =>
          Modal.updateModal({ statusMessage: err.msg }).then((_to, _force) =>
            moveFile(from, _to, _force)
          )
        ).then(() => {
          if (existingTabs.length) {
            existingTabs.forEach((tab) => {
              const newPath = tab.file.path.replace(from, to)
              api.readFile(newPath).then((data) => {
                FileStore.loadNodeData(data)
                TabStore.updateTab({ id: tab.id, editor: { filePath: newPath } })
              })
            })
          }
        })
    }

    Modal.showModal('Prompt', {
      message: i18n`file.newFileName`,
      defaultValue: oldPath,
      selectionRange: [parentPath.length, oldPath.length]
    }).then(newPath => moveFile(oldPath, newPath))
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

export default fileCommands
