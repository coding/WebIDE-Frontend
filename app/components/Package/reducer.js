import { handleActions } from 'redux-actions'
import { update } from '../../utils'
import {
  updatePackageList,
  updateLocalPackage,
  togglePackage
} from './actions'

const defaultState = {
  remotePackages: {},
  localPackages: {}
}

export default handleActions({
  [updatePackageList]: (state, action) => {
    return { ...state, remotePackages: action.payload }
  },

  [updateLocalPackage]: (state, action) => {
    const packageObj = action.payload
    updateLocalPackage(packageObj)
    return update(state, {
      localPackages: {
        [packageObj.name]: { $set: packageObj }
      }
    })
  },

  [togglePackage]: (state, action) => {
    let { name, enable } = action.payload
    let targetPackage = state.localPackages[name]
    if (enable === targetPackage.enabled) return state
    if (typeof enable !== 'boolean') enable = !targetPackage.enabled
    return update(state, {
      localPackages: {
        [name]: { enabled: { $set: enable } }
      }
    })
  }
}, defaultState)
