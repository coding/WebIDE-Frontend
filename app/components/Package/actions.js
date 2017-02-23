import { createAction } from 'redux-actions'
import { request } from '../../utils'
import api from '../../backendAPI'

export const PACKAGE_UPDATE_LIST = 'PACKAGE_UPDATE_LIST'
export const updatePackageList = createAction(PACKAGE_UPDATE_LIST, list => list)


export const fetchPackageList = () => dispatch => {
  console.log('__PACKAGE__', __PACKAGE__)
  if (__PACKAGE__ && __DEV__) {
    return dispatch(updatePackageList([{
      name: __PACKAGE__.split('/').pop()
    }]))
  }
  api.fetchPackageList()
  .then(list => dispatch(updatePackageList(list)))
}

export const PACKAGE_UPDATE_LOCAL = 'PACKAGE_UPDATE_LOCAL'
export const PACKAGE_TOGGLE = 'PACKAGE_TOGGLE'

// 往本地localstoage写一个插件的信息

export const updateLocalPackage = createAction(PACKAGE_UPDATE_LOCAL, p => p)
export const togglePackage = createAction(PACKAGE_TOGGLE, (pkgId, shouldEnable) => ({
  id: pkgId,
  shouldEnable,
}))

export const fetchPackage = (pkgId) => (dispatch) => {
  if (__DEV__ && __PACKAGE__) {
    return api.fetchPackageScript(pkgId, __PACKAGE__)
    .then(script => {
      const storageKey = `CodingPackage___${pkgId}`
      localStorage.setItem(storageKey, script)
      return storageKey
    })
  }
  // const pkgInfo = api.fetchPackageInfo(pkgId)
  // const pkgScript = api.fetchPackageScript(pkgId)
  //   .then(script => {
  //     const storageKey = `CodingPackage___${pkgId}`
  //     localStorage.setItem(storageKey, script)
  //     return storageKey
  //   })
  // Promise.all([pkgInfo, pkgScript]).then(([pkg, storageKey]) => {
  //   dispatch(updateLocalPackage({ ...pkg, storageKey, enabled: true }))
  // })
}

export const PACKAGE_ACTIVATE_EXTENSION = 'PACKAGE_ACTIVATE_EXTENSION'
export const activateExtenstion = createAction(PACKAGE_ACTIVATE_EXTENSION)
