import { observable, computed } from 'mobx'
import config from 'config'
import _ from 'lodash'

const state = observable({
  loading: false,
  collaborators: [],
  invited: [],
  get isOwner () {
    const owner = config.owner
    return owner && owner.globalKey === config.globalKey
  }
})

export default state
