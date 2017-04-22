/* @flow weak */
import config from '../../config'
import api from '../../backendAPI'
import store, { dispatch } from '../../store'
import mobxStore from '../../mobxStore'
import * as FileTreeActions from './actions'
import * as TabActions from 'commons/Tab/actions'

export default function subscribeToFileChange () {
  return api.websocketConnectedPromise.then(client =>
    client.subscribe(`/topic/ws/${config.spaceKey}/change`, frame => {
      const data = JSON.parse(frame.body)
      const node = data.fileInfo
      switch (data.changeType) {
        case 'create':
          dispatch(FileTreeActions.loadNodeData([node]))
          break
        case 'modify':
          dispatch(FileTreeActions.loadNodeData([node]))
          var tabsToUpdate = mobxStore.EditorTabState.tabs.values().filter(tab => tab.path === node.path)
          if (tabsToUpdate.length) {
            api.readFile(node.path).then(({ content }) => {
              dispatch(TabActions.updateTabByPath({
                path: node.path,
                content: { body: content }
              }))
            })
          }
          break
        case 'delete':
          dispatch(FileTreeActions.removeNode(node))
          break
      }
    })
  )
}
