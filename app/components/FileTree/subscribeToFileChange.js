/* @flow weak */
import config from '../../config'
import api from '../../backendAPI'
import store, { dispatch } from '../../store'
import * as FileTreeActions from './actions'

export default function subscribeToFileChange () {
  return api.websocketConnectedPromise.then(client =>
    client.subscribe(`/topic/ws/${config.spaceKey}/change`, frame => {
      const data = JSON.parse(frame.body)
      const node = data.fileInfo
      switch (data.changeType) {
        case 'create':
        case 'modify':
          dispatch(FileTreeActions.loadNodeData([node]))
          break
        case 'delete':
          dispatch(FileTreeActions.removeNode(node))
          break
      }
    })
  )
}
