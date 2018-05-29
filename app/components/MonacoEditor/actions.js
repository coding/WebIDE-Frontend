import { when } from 'mobx'
import icons from 'file-icons-js'

import { registerAction } from 'utils/actions'
import FileTreeState from 'components/FileTree/state'
import config from 'config'
import dispatchCommand from 'commands/dispatchCommand'
import { createTab } from 'components/Tab/actions'
import { openFile } from 'commands/commandBindings/file'
import { FileListState } from 'components/Tab/state'
import { activateTab } from 'components/Tab/actions'
import languageState from 'components/Tab/LanguageClientState'

const INMEMORY = 'inmemory'
const JDT = 'jdt'

const java = 'java/classFileContents'
when(() => config.spaceKey !== '', () => {
  config.__WORKSPACE_URI__ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`
})

export const toDefinition = registerAction('monaco:goto_definition', ({ options, resource }) => {
  const { path, scheme } = resource
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
    const languageClient = languageState.clients.get(config.mainLanguage)
    languageClient.client.sendRequest(java, { uri: resource._formatted })
      .then((data) => {
        console.log(data)
      })
  }
  // console.log(FileTreeState.entities.get(relativePath))
  // console.log(relativePath)
  // console.log(client)
  // console.log(options, resource)
  // when(() => languageState.clients.get(config.mainLanguage), () => {
  //   const client = languageState.clients.get(config.mainLanguage)
  //   console.log(client)
  // })
  /**
   * 
   */
  return new Promise((resolve, reject) => {
    resolve({
      getControl: () => null
    })
  })
})
