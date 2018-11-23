import mobxStore from '../../mobxStore'
import { path as pathUtil } from '../../utils'
import api from '../../backendAPI'
import * as Modal from '../../components/Modal/actions'
import uniqueId from 'lodash/uniqueId'
import TabStore from 'components/Tab/store'
import TabState from 'components/Tab/state'
import FileState, { extState } from 'commons/File/state'
import FileStore from 'commons/File/store'
import { notify, NOTIFY_TYPE } from '../../components/Notification/actions'
import i18n from 'utils/createI18n'
import icons from 'file-icons-js'
import config from 'config'
import { toJS, when } from 'mobx'
import emitter, { FILE_HIGHLIGHT } from 'utils/emitter'
import qs from 'qs'
import mime from 'mime-types'

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

const getMIME = (path) => {
  let contentType = mime.lookup(path);
  if (contentType) {
    const exts = ['php', 'javascript'];
    exts.map (ext => {
      if (contentType.includes(ext)) {
        contentType = contentType.replace('application', 'text');
      }
    });
  } else {
    contentType = 'text/plain'
  }

  return contentType;
}

const openUrlFile = (files) => {
  // open file depends on url

  let fileArr = [];
  if (files) {
    fileArr = files.split(',');

    const baseOpen = (i) => {
      if (i < fileArr.length) {
        let path = fileArr[i]
        if (!path.startsWith('/')) {
          path = `/${path}`;
        }
        openFile({
          path,
          contentType: getMIME(path)
        }, () => {
          i++
          baseOpen(i)
        });
      }
    }

    baseOpen(0);
  }
}

export function initOpenFile(tabs, tabGroups) {
  when(() => !FileState.initData.get('_init'), () => {
    const openedTabs = Object.values(TabState.tabs._data);
    tabs = tabs.filter(tab => {
      let flag = true;
      for (let i = 0, n = openedTabs.length; i < n; i++) {
        const cc = openedTabs[i];
        const path = cc.value.file ? cc.value.file.path : '';
        if (tab.path === path) {
          flag = false;
        }
      }
      if (flag) {
        return tab;
      }
    })

    tabs.map((tabValue) => {
      const { path, editor, contentType, ...others } = tabValue
      FileStore.loadNodeData({ ...tabValue, isEditorLoading: true })
      TabStore.createTab({
        icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
        contentType,
        editor: {
          ...editor,
          filePath: path,
        },
        ...others,
      })
      const { encoding } = FileState.initData.get(path) || {}
      api.readFile(path, encoding).then(data => {
        FileStore.loadNodeData({ ...data, isEditorLoading: false })
        FileState.initData.set(path, {})
      })
    })

    const files = qs.parse(window.location.search.slice(1)).open;
    if (files) {
      openUrlFile(files);
      return;
    }

    tabGroups.forEach((tabGroupsValue) => {
      const activeTabId = tabGroupsValue.activeTabId
      if (activeTabId ) {
        const index = tabs.findIndex(tab => tab.id === activeTabId);
        if (index >= 0) {
          const { path, contentType } = tabs[index];
          openFile({
            path,
            contentType
          });
        }
      }
    })
  })
}

export function openFile (obj, callback) {
  const { path, contentType, editor = {}, others = {}, allGroup = false } = obj;
  if (!path) return
  const { encoding } = FileState.initData.get(path) || {}
  const { encoding: currentEncoding } = FileStore.get(path) || {}
  return api.readFile(path, encoding || currentEncoding).then((data) => {
    FileStore.loadNodeData(data)
    FileState.initData.set(path, {})
    for (const listener of extState.didOpenListeners) {
      listener(FileState.entities.get(path))
    }
    return data
  }).then(() => {
    const activeTabGroup = TabStore.getState().activeTabGroup
    const existingTabs = TabStore.findTab(
      tab => tab.file && tab.file.path === path && (tab.tabGroup === activeTabGroup || allGroup)
    )
    if (existingTabs.length) {
      const existingTab = existingTabs[0]
      if (editor.gitBlame) {
        existingTab.editor.gitBlame = editor.gitBlame
      }
      if (editor.selection) {
        const { startLineNumber, startColumn } = editor.selection

        const pos = {
          lineNumber: startLineNumber,
          column: startColumn,
        }
  
        setTimeout(() => {
          existingTab.editorInfo.monacoEditor.setSelection(editor.selection)
          existingTab.editorInfo.monacoEditor.revealPositionInCenter(pos, 1)
          existingTab.editorInfo.monacoEditor.focus()
        }, 0)
      }

      if (editor.debug) {
        existingTab.editorInfo.debug = true
        existingTab.editorInfo.line = editor.line
        existingTab.editorInfo.stoppedReason = editor.stoppedReason
        existingTab.editorInfo.setDebugDeltaDecorations()
      }
      existingTab.activate()
      if (callback) callback(existingTab.id)
    } else {
      const tabId = uniqueId('tab_')
      TabStore.createTab({
        icon: icons.getClassWithColor(path.split('/').pop()) || 'fa fa-file-text-o',
        contentType,
        editor: {
          ...editor,
          filePath: path,
        },
        id: tabId,
        ...others,
      })
      if (callback) {
        callback(tabId)
      }
    }
  }).catch(e => {
    if (callback) {
      callback(null);
    }
  })
}

function createFileWithContent (content) {
  return function createFileAtPath (path) {
    path = path.startsWith('/') ? path : `/${path}`
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
          return res;
        }
      })
      .then(res => {
        openFile({ path, contentType: res.contentType })
      })
      // if error, try again.
      .catch((res) => {
        Modal.updateModal({ statusMessage: res.response ? res.response.data.msg : res.message }).then(createFileAtPath)
      })
  }
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
  'file:highlight_line': (c) => {
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
  'file:save': (c) => {
    const { EditorTabState } = mobxStore
    const activeTab = EditorTabState.activeTab
    const content = activeTab.editorInfo.monacoEditor.getValue()
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

  'file:save_monaco': (context) => {
    const { data } = context
    const { EditorTabState } = mobxStore
    const activeTab = EditorTabState.activeTab
    if (activeTab.file) {
      api.writeFile(activeTab.file.path, data)
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
    const existingTabs = TabStore.findTab(
      tab => tab.type === 'welcome'
    )
    if (existingTabs.length) {
      const existingTab = existingTabs[0]
      existingTab.activate()
    } else {
      TabStore.createTab({
        icon: 'fa fa-smile-o',
        type: 'welcome',
        title: 'Welcome',
      })
    }
  },
  'file:open_changelog': () => {
    const existingTabs = TabStore.findTab(
      tab => tab.type === 'changelog'
    )
    if (existingTabs.length) {
      const existingTab = existingTabs[0]
      existingTab.activate()
    } else {
      TabStore.createTab({
        type: 'changelog',
        title: 'Changelog',
      })
    }
  },
  'file:open_about': () => {
    Modal.showModal({ type: 'About', position: 'center' })
  },

  'file:add_ignore': (c) => {
    const ignorePath = '/.gitignore'
    const ignoreExists = FileStore.get(ignorePath)

    const { isDir, path } = c.context
    const patchTxt = isDir ? `${path}/` : path

    if (ignoreExists) {
      api.readFile(ignorePath)
      .then(ignoreFile => {
        const ignoreContent = ignoreFile.content
        !ignoreContent.split('\n').some(item => patchTxt.startsWith(item)) ?
        api.writeFile(
          ignorePath,
          ignoreFile.content ? `${ignoreFile.content}\n${patchTxt}`
                             : patchTxt
        )
        .then(res => {
          FileStore.updateFile({
            path: ignorePath,
            isSynced: true,
            lastModified: res.lastModified,
          })

          notify({ message: i18n`file.updateIgnoreSuccess` })
          openFile({ path: ignorePath })
        })
        .catch(err => {
          notify({
            notifyType: NOTIFY_TYPE.ERROR,
            message: i18n`file.updateIgnoreFailed${{err: err.msg}}`
          })
        }) : notify({ message: i18n`file.updateIgnoreTip${{path}}` })
      })
    } else {
      api.createFile(ignorePath, patchTxt)
      .then((res) => {
        if (res.msg) {
          throw new Error(res.msg);
        }
      })
      .then(() => api.writeFile(ignorePath, patchTxt))
      .then(() => {
        notify({ message: i18n`file.updateIgnoreSuccess` })
        openFile({ path: ignorePath })
      })
      .catch(err => {
        notify({
          notifyType: NOTIFY_TYPE.ERROR,
          message: i18n`file.updateIgnoreFailed${{err: err.msg}}`
        })
      })
    }
  }
}

export default fileCommands
