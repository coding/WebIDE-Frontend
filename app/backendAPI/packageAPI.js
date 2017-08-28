import axios from 'axios'
import { request } from '../utils'
import { PluginRegistry } from 'utils/plugins'
import config from '../config'
import { fetchPackage } from '../components/Plugins/actions'
const { packageServer, packageDev } = config


const io = require('socket.io-client/dist/socket.io.min.js')

export const fetchRequiredPackageList = () => {
  if (packageDev) {
    return request.get(`${packageServer}/packages/`)
  }
  return request.get('/packages?requirement=Required')
}
export const fetchPackageList = () => {
  if (packageDev) {
    return request.get(`${packageServer}/packages/`)
  }
  if (config.isPlatform) {
    return request.get(`/workspaces/${config.spaceKey}/packages`)
  }
  return request.get('/packages')
}

export const fetchPackageInfo = (pkgName, pkgVersion, target) =>
  axios.get(`${target || packageServer}/packages/${pkgName}/${pkgVersion}/manifest.json`).then(res => res.data)

export const fetchPackageScript = (pkgName, pkgVersion, target) =>
  axios.get(`${target || packageServer}/packages/${pkgName}/${pkgVersion}/index.js`).then(res => res.data)

export const enablePackageHotReload = (target) => {
  const socket = io.connect(target || packageServer, {
    reconnection: true,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 5,
    transports: ['websocket']
  })
  socket.on('change', (data) => {
    if (!data) return
    if (target) {
      console.log(`plugin is reloading from ${target}`, data)
      data.codingIdePackage.TARGET = target
    }
    fetchPackage(data.codingIdePackage, 'reload')
  })
}
