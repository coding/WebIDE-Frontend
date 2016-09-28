/* @flow weak */
import config from '../../config'
import api from '../../api'
import store from '../../store'
import * as FileTreeActions from './actions'

export default function subscribeToFileChange () {
  return api.websocketConnectedPromise.then(client =>
    client.subscribe(`/topic/ws/${config.spaceKey}/change`, frame=>{
      var data = JSON.parse(frame.body)
      var file = data.fileInfo
      if (data.lastModified) file.lastModified = data.lastModified
      switch (data.changeType) {
        case 'delete':
          console.log(store);
      }
    })
  )
}
