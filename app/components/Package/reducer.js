import { handleActions } from 'redux-actions'
import { update } from '../../utils'
import {
  updatePackageList,
  updateLocalPackage,
  togglePackage,
  activateExtenstion,
} from './actions'

const defaultState = {
  remotePackages: [],
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
  const pkg = state.localPackages[pkgId]
  if (!pkg.type === 'extension' || !pkg.ui || !pkg.ui.position) return state

  const extensionIds = state.extensionsUIState.panels[pkg.ui.position].extensionIds
  if (extensionIds.includes(pkgId) === pkg.enabled) return state

  const nextState = update(state, {
    extensionsUIState: { panels: { [pkg.ui.position]: {
      extensionIds: pkg.enabled
        ? { $push: [pkgId] }
        : { $without: pkgId }
    } }
    }
  })
  return nextState
}

export default handleActions({
  [updatePackageList]: (state, action) => ({ ...state, remotePackages: action.payload }),

  [updateLocalPackage]: (state, action) => {
    const packageObj = action.payload
    const nextState = update(state, {
      localPackages: {
        [packageObj.id]: { $set: packageObj }
      }
    })
    return toggleExtensionAvailability(nextState, packageObj.id)
  },

  [togglePackage]: (state, action) => {
    const { id } = action.payload
    let { shouldEnable } = action.payload
    const targetPackage = state.localPackages[id]
    if (shouldEnable === targetPackage.enabled) return state
    if (typeof shouldEnable !== 'boolean') shouldEnable = !targetPackage.enabled

    const nextState = update(state, {
      localPackages: {
        [id]: { enabled: { $set: shouldEnable } }
      }
    })

    return toggleExtensionAvailability(nextState, id)
  }

}, defaultState)


const getPanelByRef = (PanelState, ref) => PanelState.panels[PanelState.panelRefs[ref]]
export const PackageCrossReducer = handleActions({
  [activateExtenstion]: (allState, action) => {
    let nextState = allState
    let packageId = action.payload

    const { PackageState, PanelState } = allState
    const pkg = PackageState.localPackages[packageId]
    const panelSide = pkg.ui.position

    const activeExtenstionId = PackageState.extensionsUIState.panels[panelSide].activeExtenstionId
    const targetPanel = getPanelByRef(PanelState, `PANEL_${panelSide.toUpperCase()}`)

    if (activeExtenstionId === packageId) packageId = ''
    const shouldHidePanel = packageId ? false : true
    nextState = update(nextState, {
      PanelState: {
        panels: {
          [targetPanel.id]: { hide: { $set: shouldHidePanel } }
        }
      }
    })

    // special case: redistribute size between center and right panel
    if (targetPanel.ref === 'PANEL_RIGHT') {
      const centerPanel = getPanelByRef(nextState.PanelState, 'PANEL_CENTER')
      let centerPanelSize = shouldHidePanel
        ? centerPanel.size + targetPanel.size
        : centerPanel.size - targetPanel.size
      if (centerPanelSize <= 0) centerPanelSize = targetPanel.size

      nextState = update(nextState, {
        PanelState: {
          panels: {
            [centerPanel.id]: {
              size: { $set: centerPanelSize }
            }
          }
        }
      })
    }

    return update(nextState, {
      PackageState: {
        extensionsUIState: { panels: { [panelSide]: {
          activeExtenstionId: { $set: packageId }
        } } }
      }
    })
  }
})

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
