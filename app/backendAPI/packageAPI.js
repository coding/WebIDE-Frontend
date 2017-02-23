/* @flow weak */
import { request } from '../utils'
import config from '../config'
const packageServer = config.packageServer

export const fetchPackageList = () => request.get(`${packageServer}/packages`)
export const fetchPackageInfo = (pkgName) => request.get(`${packageServer}/packages/${pkgName}`)
export const fetchPackageScript = (pkgName, debugPackage) =>
request.get(`${debugPackage}.js`)
