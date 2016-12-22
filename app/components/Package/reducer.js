import { handleActions } from 'redux-actions'
import { update } from '../../utils'
import {
  updatePackageList,
  updateLocalPackage,
  togglePackage,
  activateExtenstion,
} from './actions'

const defaultState = {
  remotePackages: {},
  localPackages: {},
  extensionsUIState: {
    panels: {
      right: {
        extensionIds: [],
        activeExtenstionId: '',
      },
      left: {
        extensionIds: [],
        activeExtenstionId: '',
      },
      bottom: {
        extensionIds: [],
        activeExtenstionId: '',
      }
    },
  },
}

const toggleExtensionAvailability = (state, pkgId) => {
  // handle availability state of extension packages in side panels
  let pkg = state.localPackages[pkgId]
  if (!pkg.type === 'extension' || !pkg.ui || !pkg.ui.position) return state

  let extensionIds = state.extensionsUIState.panels[pkg.ui.position].extensionIds
  if (extensionIds.includes(pkgId) === pkg.enabled) return state

  return update(state, {
    extensionsUIState: { panels: { [pkg.ui.position]: {
      extensionIds: pkg.enabled
        ? {'$push' : [pkgId] }
        : {'$without': pkgId }
    }}}
  })

}

export default handleActions({
  [updatePackageList]: (state, action) => {
    return { ...state, remotePackages: action.payload }
  },

  [updateLocalPackage]: (state, action) => {
    const packageObj = action.payload
    let nextState = update(state, {
      localPackages: {
        [packageObj.id]: { $set: packageObj }
      }
    })
    return toggleExtensionAvailability(nextState, packageObj.id)
  },

  [togglePackage]: (state, action) => {
    let { id, shouldEnable } = action.payload
    let targetPackage = state.localPackages[id]
    if (shouldEnable === targetPackage.enabled) return state
    if (typeof shouldEnable !== 'boolean') shouldEnable = !targetPackage.enabled

    let nextState = update(state, {
      localPackages: {
        [id]: { enabled: { $set: shouldEnable } }
      }
    })

    return toggleExtensionAvailability(nextState, id)
  },

  [activateExtenstion]: (state, action) => {
    const packageId = action.payload
    let pkg = state.localPackages[packageId]
    let panelSide = pkg.ui.position
    return update(state, {
      extensionsUIState: { panels: {[panelSide]: {
        activeExtenstionId: { $set: packageId }
      }}}
    })
  }
}, defaultState)


/*
Example package manifest:

{
  id: "coding-ide-env",
  version: "0.0.1",
  description: "Extension for Coding WebIDE, manage IDE environment",
  main: "index.js",
  type: "extension",
  ui: {
    position: "right",
    label: {
      text: "Environment",
      icon: "fa fa-close"
    }
  }
}

 */
