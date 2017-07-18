import { observable, computed } from 'mobx'
import config from 'config'
import _ from 'lodash'

const state = observable({
  collaborators: [],
  invited: [],
  get isOwner () {
    const owner = _.find(this.collaborators, item => (item.inviteBy === 'Owner'
    ))
    return owner && owner.collaborator.globalKey === config.globalKey
  }
})

export default state
