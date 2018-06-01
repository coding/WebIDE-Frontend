import { when } from 'mobx'
import Uri from 'vscode-uri'
import { registerAction } from 'utils/actions'
import FileTreeState from 'components/FileTree/state'
import config from 'config'
import dispatchCommand from 'commands/dispatchCommand'
import { createTab } from 'components/Tab/actions'
import { openFile } from 'commands/commandBindings/file'
import TabState from 'components/Tab/state'
import { activateTab } from 'components/Tab/actions'
import LanguageState, { LanguageClient } from 'components/Tab/LanguageClientState'

import { supportLangServer } from './utils/languages'
import { JAVA_CLASS_PATH_REQUEST } from './languageRequestTypes'

const INMEMORY = 'inmemory'
const JDT = 'jdt'

when(() => config.spaceKey !== '', () => {
  config.__WORKSPACE_URI__ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`
})

export const toDefinition = registerAction('monaco:goto_definition', ({ options, resource }) => {
  const { path, scheme, query, fsPath, authority } = resource
  const { selection } = options
  if (scheme === INMEMORY) return false
  if (scheme !== JDT) {
    const relativePath = path.substring(config.__WORKSPACE_URI__.length)
    const fileTreeNode = FileTreeState.entities.get(relativePath)
    if (fileTreeNode) {
      // 已打开过
      dispatchCommand('file:open_file', {
        path: fileTreeNode.path,
        editor: { filePath: relativePath, selection },
      })
    } else {
      openFile({ path: relativePath, editor: { filePath: relativePath, selection } })
    }
  } else {
    const languageClient = LanguageState.clients.get(config.mainLanguage)
    const fileName = resource.path.split('/').pop()
    const tabItem = TabState.tabs.get(`fake_${fileName}`)
    let formattedUri
    if (!resource._formatted) {
      formattedUri = resource.toString()
    } else {
      formattedUri = resource._formatted
    }
    if (tabItem) {
      activateTab(`fake_${fileName}`)
    } else {
      languageClient.client.sendRequest(JAVA_CLASS_PATH_REQUEST, { uri: formattedUri })
        .then((data) => {
          createTab({
            title: fileName,
            id: `fake_${fileName}`,
            icon: 'fa fa-file-o',
            editor: {
              // selection,
              content: data,
              readOnly: true,
              filePath: resource.path,
            },
          })
        })
    }
  }
  /**
   * 
   */
  return new Promise((resolve, reject) => {
    resolve({
      getControl: () => null
    })
  })
})

/**
 * @param language 指定创建语言服务的语言类型 （java/javascript等）
 * @TODO：后续加入指定代码目录
 * 一个项目下，同一个语言只能开启一个语言服务。
 * 目前一个项目一共只能开启一个语言服务。
 * 如果手动设置了项目语言，创建并启动新的语言服务后，首先会发送 initialize，消息在服务器端对语言服务进行初始化。
 * 打开新 tab (新文件)，编辑器会首先判断已打开文件语言类型是否为已设置的项目语言，是则发送 document/didOpen 消息，正确响应后开始提供语言服务。
 */
export const createLanguageClient = registerAction('language:create_client', (language) => {
  const currentClient = LanguageState.clients.get(language)
  if (currentClient || !supportLangServer.some(l => l.lang === language)) {
    return false
  }

  const newClient = new LanguageClient(language)
  LanguageState.clients.set(language, newClient)
})
