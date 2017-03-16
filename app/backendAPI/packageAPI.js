/* @flow weak */
import { request } from '../utils'
import axios from 'axios'
import config from '../config'
import store from '../store'
import { fetchPackage } from '../components/Package/actions'
const { packageServer } = config

const io = require('socket.io-client/dist/socket.io.min.js')

export const fetchPackageList = () => {
  if (config.isPlatform) {
    return request.get(`/users/${config.globalKey}/packages`)
  } else {
    return request.get(`/packages`)
  }
}

export const fetchPackageInfo = (pkgName, pkgVersion) =>
  axios.get(`${packageServer}/packages/${pkgName}/${pkgVersion}/manifest.json`).then(res => res.data)

export const fetchPackageScript = (pkgName, pkgVersion) =>
  axios.get(`${packageServer}/packages/${pkgName}/${pkgVersion}/index.js`).then(res => res.data)

export const enablePackageHotReload = () => {
  const socket = io.connect(packageServer, {
    reconnection: true,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 5,
    transports: ['websocket']
  })
  socket.on('change', () => {
    console.log('plugin is reloading')
    const { localPackages } = store.getState().PackageState
    if (Object.keys(localPackages).length) {
      store.dispatch(fetchPackage(Object.keys(localPackages)[0]))
    }
  })
}
