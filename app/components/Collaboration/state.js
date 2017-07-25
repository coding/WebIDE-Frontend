import { observable, computed } from 'mobx'
import config from 'config'
import _ from 'lodash'

const state = observable({
  loading: false,
  collaborators: [],
  invited: [],
  paths: {},
  chatList: [],
  get isOwner () {
    const owner = config.owner
    return owner && owner.globalKey === config.globalKey
  },
  get sortedList () {
    const sortedList = this.collaborators.sort((a, b) => {
      if (a.inviteBy === 'Owner') {
        return -1
      } else if (b.inviteBy === 'Owner') {
        return 1
      } else {
        if (a.online && !b.online) {
          return -1
        } else if (!a.online && b.online) {
          return 1
        }
        return 0
      }
    })
    return sortedList
  }
})

export default state
