import api from 'backendAPI'
import state from './state'

export const fetchCollaborators = () => {
  return api.fetchCollaborators().then((res) => {
    state.collaborators = res.map((item) => {
      if (!/^(http|https):\/\/[^ "]+$/.test(item.collaborator.avatar)) {
        item.collaborator.avatar = `https://coding.net${item.collaborator.avatar}`
      }
      item.online = false
      item.clientIds = []
      return item
    })
  })
}

export const fetchInvitedCollaborators = () => {
  return api.fetchCollaborators('Invited').then((res) => {
    state.invited = res
  })
}

export const postCollaborators = (inviteKey) => {
  return api.postCollaborators(inviteKey)
}

export const deleteCollaborators = (globalKey) => {
  return api.deleteCollaborators(globalKey)
}
