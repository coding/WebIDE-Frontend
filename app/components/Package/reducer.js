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

const toggleExtensionAvailability = (state, pkgName) => {
  // handle availability state of extension packages in side panels
  let pkg = state.localPackages[pkgName]
  if (!pkg.type === 'extension' || !pkg.ui || !pkg.ui.position) return state

  let extensionIds = state.extensionsUIState.panels[pkg.ui.position].extensionIds
  if (extensionIds.includes(pkgName) === pkg.enabled) return state

  return update(state, {
    extensionsUIState: { panels: { [pkg.ui.position]: {
      extensionIds: pkg.enabled
        ? {'$push' : [pkgName] }
        : {'$without': pkgName }
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
        [packageObj.name]: { $set: packageObj }
      }
    })
    return toggleExtensionAvailability(nextState, packageObj.name)
  },

  [togglePackage]: (state, action) => {
    let { name, shouldEnable } = action.payload
    let targetPackage = state.localPackages[name]
    if (shouldEnable === targetPackage.enabled) return state
    if (typeof shouldEnable !== 'boolean') shouldEnable = !targetPackage.enabled

    let nextState = update(state, {
      localPackages: {
        [name]: { enabled: { $set: shouldEnable } }
      }
    })

    return toggleExtensionAvailability(nextState, name)
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
  name: "coding-ide-env",
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
