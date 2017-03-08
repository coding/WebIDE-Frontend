/* @flow weak */
import { request } from '../utils'
import config from '../config'

const { packageServer } = config
const devPackageServer = __PACKAGE_SERVER__

export const fetchPackageList = () => request.get(`${devPackageServer || packageServer}/packages`)
export const fetchPackageInfo = (pkgName) =>
request.get(`${devPackageServer || packageServer}/packages/${pkgName}`)

export const fetchPackageScript = (pkgName) => {
  if (devPackageServer) {
    return request.get(`${devPackageServer}/packages/${pkgName}/download`)
  }
}

