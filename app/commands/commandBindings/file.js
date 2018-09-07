import mobxStore from '../../mobxStore'
import { path as pathUtil } from '../../utils'
import api from '../../backendAPI'
import * as Modal from '../../components/Modal/actions'
import TabStore from 'components/Tab/store'
import FileState from 'commons/File/state'
import FileStore from 'commons/File/store'
import { state as unitTestState } from 'components/UnitTest'
import { notify } from '../../components/Notification/actions'
import i18n from 'utils/createI18n'
import icons from 'file-icons-js'
import { toJS, when } from 'mobx'
import emitter, { FILE_HIGHLIGHT } from 'utils/emitter'
import { activateSidePanelView } from 'components/Panel/SideBar/actions'

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


export function openFile (obj, callback) {
  if (!obj.path) return
  // 做一些encoding的调度
  if (FileState.initData.get('_init')) {
    when(() => !FileState.initData.get('_init'), () => {
      const { encoding } = FileState.initData.get(obj.path) || {}
      openFileWithEncoding({ ...obj, encoding, callback })
      FileState.initData.set(obj.path, {})
    })
  } else {
    const { encoding } = FileState.initData.get(obj.path) || {}
    openFileWithEncoding({ ...obj, encoding, callback })
    FileState.initData.set(obj.path, {})
  }
}

export function openFileWithEncoding ({ path, editor = {}, others = {}, allGroup = false, encoding, callback }) {
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
        if (editor.gitBlame) {
          existingTab.editor.gitBlame = editor.gitBlame
        }
        existingTab.activate()
        if (callback) callback()
      } else {
        TabStore.createTab({
          icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
          editor: {
            ...editor,
            filePath: path,
          },
          ...others
        })
        if (callback) {
          callback()
        }
      }
    })
}

function createTab ({ icon, type }) {
  TabStore.createTab({
    icon,
    type,
  })
}

function createFileWithContent (content) {
  return function createFileAtPath (path) {
    if (content) {
      return api.createFile(path, content)
        .then((res) => {
          if (res.msg) {
            throw new Error(res.msg)
          } else {
            Modal.dismissModal()
          }
        })
        .then(() => api.writeFile(path, content))
        .then(() => {
          api.readFile(path).then((data) => {
            const { EditorTabState } = mobxStore
            const activeTab = EditorTabState.activeTab
            FileStore.loadNodeData(data)
            TabStore.updateTab({
              icon: (path && icons.getClassWithColor(path.split('/').pop())) || 'fa fa-file-text-o',
              id: activeTab.id,
              editor: { filePath: path },
            })
          })
        })
        .catch((res) => {
          Modal.updateModal({ statusMessage: res.response ? res.response.data.msg : res.message }).then(createFileAtPath)
        })
    }
    return api.createFile(path, content)
      .then((res) => {
        if (res.msg) {
          throw new Error(res.msg)
        } else {
          Modal.dismissModal()
        }
      })
      .then(() => {
        openFile({ path })
      })
      // if error, try again.
      .catch((res) => {
        Modal.updateModal({ statusMessage: res.response ? res.response.data.msg : res.message }).then(createFileAtPath)
      })
  }
}

const fileCommands = {
  'file:open_help': (c) => {
    TabStore.createTab({
      title: 'Help',
      icon: 'fa fa-file-o',
      editor: {
      },
      tabType: 'help'
    })
  },
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
  'file:highlight_line': (c) => {
    console.log('file:highlight_line', c)
    const { path, lineNumber } = c.data
    openFile({ path, allGroup: true }, () => {
      emitter.emit(FILE_HIGHLIGHT, c.data)
    })
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
  'file:generate_unit_test': (c) => {
    const node = c.context
    const path = node.path || ''
    api.createTestFile(path)
  },
  'file:generate_class': (c) => {
    const node = c.context
    const path = node.path || ''
    api.createClassFile(path)
  },
  'file:run_unit_test': (c) => {
    const node = c.context
    const path = node.path || ''
    api.runTestFile(path)
      .then((data) => {
        unitTestState.testOutput = data
        activateSidePanelView('SIDEBAR.BOTTOM.unitTest')
      })
      .catch(() => {})
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
    } else {
      api.writeFile(activeTab.file.path, content)
        .then((res) => {
          FileStore.updateFile({
            path: activeTab.file.path,
            isSynced: true,
            lastModified: res.lastModified,
            // content,
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
  'file:open_welcome': (c) => {
    // const activeTabGroup = TabStore.getState().activeTabGroup
    // const existingTabs = TabStore.findTab(
    //   tab => tab.type === 'welcome'
    // )
    // if (existingTabs.length) {
    //   const existingTab = existingTabs[0]
    //   existingTab.activate()
    // } else {
    //   TabStore.createTab({
    //     icon: 'fa fa-info-circle',
    //     type: 'welcome',
    //     title: 'Welcome',
    //   })
    // }
  },
}

export default fileCommands
