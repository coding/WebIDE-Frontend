/* @flow weak */
import config from '../../config'
import api from '../../api'
import store, { dispatch } from '../../store'
import * as FileTreeActions from './actions'

export default function subscribeToFileChange () {
  return api.websocketConnectedPromise.then(client =>
    client.subscribe(`/topic/ws/${config.spaceKey}/change`, frame => {
      var data = JSON.parse(frame.body)
      var node = data.fileInfo
      if (data.lastModified) node.lastModified = data.lastModified
      switch (data.changeType) {
        case 'create':
          dispatch(FileTreeActions.loadNodeData([node]))
          break
        case 'delete':
          dispatch(FileTreeActions.removeNode(node))
          break
      }
    })
  )
}
