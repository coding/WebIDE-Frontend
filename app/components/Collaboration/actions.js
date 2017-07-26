import api from 'backendAPI'
import { toJS } from 'mobx'
import FileStore from 'commons/File/store'
import * as TabActions from 'components/Tab/actions'
import state from './state'
import ChatManager from './ot/chat'
import config from 'config'

export const fetchCollaborators = () => {
  if (state.loading) return
  state.loading = true
  return api.fetchCollaborators().then((res) => {
    state.collaborators = res.map((item) => {
      if (!/^(http|https):\/\/[^ "]+$/.test(item.collaborator.avatar)) {
        item.collaborator.avatar = `https://coding.net${item.collaborator.avatar}`
      }
      const oldItem = state.collaborators.find((c) => c.collaborator.globalKey === item.collaborator.globalKey)
      if (oldItem) {
        item.online = oldItem.online
      } else {
        item.online = false
      }
      item.clientIds = []
      item.path = ''
      const pathItem = state.paths[item.collaborator.globalKey]
      if (pathItem) {
        item.path = pathItem
      }
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

export const saveChat = () => {
  const currentChatList = (toJS(state.chatList))
  let chatStorage = localStorage.getItem('chat')
  if (!chatStorage) {
    chatStorage = {}
    chatStorage[config.spaceKey] = {}
  } else {
    chatStorage = JSON.parse(chatStorage)
  }
  chatStorage[config.spaceKey][config.globalKey] = currentChatList
  localStorage.setItem('chat', JSON.stringify(chatStorage))
}

export const loadChat = () => {
  let chatStorage = localStorage.getItem('chat')
  if (!chatStorage) {
    chatStorage = {}
  } else {
    chatStorage = JSON.parse(chatStorage)
  }
  if (!chatStorage[config.spaceKey]) {
    chatStorage[config.spaceKey] = {}
  }
  if (!chatStorage[config.spaceKey][config.globalKey]) {
    chatStorage[config.spaceKey][config.globalKey] = []
  }
  state.chatList = chatStorage[config.spaceKey][config.globalKey]
}
