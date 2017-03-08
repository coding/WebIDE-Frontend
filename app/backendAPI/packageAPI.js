/* @flow weak */
import { request } from '../utils'
import config from '../config'
import store from '../store'
import { fetchPackage } from '../components/Package/actions'

const { packageServer } = config
const devPackageServer = __PACKAGE_SERVER__

const io = require('socket.io-client/dist/socket.io.min.js')

export const fetchPackageList = () => request.get(`${devPackageServer || packageServer}/packages`)
export const fetchPackageInfo = (pkgName) =>
request.get(`${devPackageServer || packageServer}/packages/${pkgName}`)

export const fetchPackageScript = (pkgName) => {
  if (devPackageServer) {
    return request.get(`${devPackageServer}/static/${pkgName}.js`)
  }
}
export const enablePackageHotReload = () => {
  const socket = io.connect('http://localhost:4000', {
    // 'force new connection': true,
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
