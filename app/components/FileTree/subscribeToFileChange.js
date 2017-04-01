/* @flow weak */
import config from '../../config'
import api from '../../backendAPI'
import store, { dispatch } from '../../store'
import * as FileTreeActions from './actions'
import { actions as TabActions, selectors as TabSelectors } from '../Tab'

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
          var tabsToUpdate = TabSelectors.getTabsByPath(store.getState().TabState, node.path)
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
