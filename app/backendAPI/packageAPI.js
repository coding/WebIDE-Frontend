/* @flow weak */
import { request } from '../utils'
import config from '../config'

const { packageServer, extensionServer } = config

export const fetchPackageList = () => request.get(`${packageServer}/packages`)
export const fetchPackageInfo = (pkgName) =>
request.get(`${packageServer}/packages/${pkgName}`)
export const fetchPackageScript = (pkgName, debugServer) => {
  if (debugServer) {
    return request.get(`${debugServer}/${pkgName}.js`)
  }
}
