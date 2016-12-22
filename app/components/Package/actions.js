import { createAction } from 'redux-actions'
import { request } from '../../utils'
import api from '../../backendAPI'

export const PACKAGE_UPDATE_LIST = 'PACKAGE_UPDATE_LIST'
export const updatePackageList = createAction(PACKAGE_UPDATE_LIST)

export const fetchPackageList = () => dispatch => {
  api.fetchPackageList().then(list => dispatch(updatePackageList(list)))
}

export const PACKAGE_UPDATE_LOCAL = 'PACKAGE_UPDATE_LOCAL'
export const updateLocalPackage = createAction(PACKAGE_UPDATE_LOCAL)

export const PACKAGE_TOGGLE = 'PACKAGE_TOGGLE'
export const togglePackage = createAction(PACKAGE_TOGGLE, (pkgName, shouldEnable) => ({
  name: pkgName,
  shouldEnable: shouldEnable
}))

export const fetchPackage = (pkgName) => (dispatch, getState) => {
  const pkgInfo = api.fetchPackageInfo(pkgName)
  const pkgScript = api.fetchPackageScript(pkgName)
    .then(script => {
      let storageKey = `CodingPackage___${pkgName}`
      localStorage.setItem(storageKey, script)
      return storageKey
    })

  Promise.all([pkgInfo, pkgScript]).then(([pkg, storageKey]) => {
    dispatch(updateLocalPackage({...pkg, storageKey, enabled: true}))
  })
}

export const PACKAGE_ACTIVATE_EXTENSION = 'PACKAGE_ACTIVATE_EXTENSION'
export const activateExtenstion = createAction(PACKAGE_ACTIVATE_EXTENSION)
