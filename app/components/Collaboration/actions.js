import api from 'backendAPI'
import FileStore from 'commons/File/store'
import * as TabActions from 'components/Tab/actions'
import state from './state'
import ChatManager from './ot/chat'

export const fetchCollaborators = () => {
  if (state.loading) return
  state.loading = true
  return api.fetchCollaborators().then((res) => {
    state.collaborators = res.map((item) => {
      if (!/^(http|https):\/\/[^ "]+$/.test(item.collaborator.avatar)) {
        item.collaborator.avatar = `https://coding.net${item.collaborator.avatar}`
      }
      item.online = false
      item.clientIds = []
      item.path = ''
      return item
    })
    state.loading = false
    return res
  })
}

export const fetchInvitedCollaborators = () => {
  return api.fetchCollaborators('Invited').then((res) => {
    state.invited = res
  })
}

export const postCollaborators = (inviteKey) => {
  return api.postCollaborators(inviteKey).then(res => {
    const chatManager = new ChatManager()
    chatManager.sendAction({ action: 'Add' })
  })
}

export const deleteCollaborators = (id, globalKey) => {
  return api.deleteCollaborators(id).then(res => {
    const chatManager = new ChatManager()
    chatManager.sendAction({ action: 'Remove', globalKey })
  })
}

// fixme: openFile function should be move to commandBinding/file.js
export const openFile = ({ path }) => {
  api.readFile(path)
  .then(data => {
    FileStore.loadNodeData(data)
    return data
  })
  .then((data) => {
    TabActions.createTab({
      title: path.split('/').pop(),
      icon: 'fa fa-file-o',
      editor: {
        revision: data.hashedVersion,
        filePath: path,
      }
    })
  })
}

