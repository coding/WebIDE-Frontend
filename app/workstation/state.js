import { extendObservable, observable } from 'mobx'
import config from '../config'
import api from '../backendAPI'
import { qs } from '../utils'
// import CodingSDK from '../CodingSDK'
import initializeState from '../containers/Initialize/state'
import * as platformApi from './api'

const urlPath = window.location.pathname
const qsParsed = qs.parse(window.location.search.slice(1))


const stepCache = observable.map({
  getSpaceKey: {
    desc: 'Get spaceKey from window.location',
    func: async () => {
    // case 0: isTry
      if (qsParsed.isTry) return true
    // case 1: spaceKey in url
      let spaceKey = null
      // DEMO
      spaceKey = 'default'
      // const wsPathPattern = /^\/ws\/([^/]+)\/?$/
      // const match = wsPathPattern.exec(urlPath)
      // if (match) spaceKey = match[1]
      if (spaceKey) return config.spaceKey = spaceKey

    // case 2: spaceKey in querystring
      // spaceKey = qsParsed.spaceKey
      
      // if (spaceKey) return config.spaceKey = spaceKey

      return true // MISSING OF SPACEKEY SHOULD NOT BLOCK
    }
  },
  initDefaultWorkspace: {
    desc: 'Init default workspace -- platform',
    enable: () => config.spaceKey === 'default',
    func: () => {
      return platformApi.getDefaultWorkspace().then((defaultList) => {
        if (defaultList.length > 0) {
          const defaultWS = defaultList[0];
          config.spaceKey = defaultWS.spaceKey;
          config.isDefaultWorkspace = true;
          config.projectName = 'Home';
          return true;
        } else {
          const options = {
            cpuLimit: 1,
            memory: 128,
            storage: 1,
            default: true,
          };
          return api.createWorkspace(options).then((res) => {
            extendObservable(config, res);

            if (config.project && config.project.name) {
              config.projectName = config.project.name;
            } else {
              config.projectName = 'Home';
            }
            if (window.history.pushState && config.projectName !== 'Default') {
              window.history.pushState(null, null,
              `${window.location.origin}/ws/${config.spaceKey}`);
            }

            // const clonedState = this.waitTillCloned(res);
            // if (clonedState) return clonedState;
            return true;
          }).catch((res) => {
            if (res.msg) {
              initializeState.errorCode = res.code;
              initializeState.errorInfo = res.msg;
            }
            return false;
          });
        }
      });
    },
  },
  // checkExist: {
  //   desc: 'Check if workspace exist',
  //   enable: () => config.spaceKey,
  //   func: () => api.isWorkspaceExist()
  // },
  createWorkspace: {
    desc: 'Try create workspace -- platform',
    enable: () => !config.spaceKey,
    func: () => {
      const queryEntryPathPattern = /^\/ws\/?$/
      const isFromQueryEntryPath = queryEntryPathPattern.test(urlPath)
      if (isFromQueryEntryPath) {
        const options = {
          ownerName: qsParsed.ownerName,
          projectName: qsParsed.projectName,
          host: qsParsed.host,
          cpuLimit: 1,
          memory: 128,
          storage: 1,
        }
        if (qsParsed.envId) options.envId = qsParsed.envId
        if (qsParsed.isTry) options.try = true
        return api.createWorkspace(options).then((res) => {
          extendObservable(config, res)

          if (config.project && config.project.name) { config.projectName = config.project.name }
          if (window.history.pushState) {
            window.history.pushState(null, null,
            `${window.location.origin}/ws/${config.spaceKey}`)
          }

          // const clonedState = this.waitTillCloned(res)
          // if (clonedState) return clonedState
          return true
        }).catch((res) => {
          if (res.msg) {
            initializeState.errorCode = res.code
            initializeState.errorInfo = res.msg
          }
          return false
        })
      }
      return false
    },
  },
  setupWorkspace: {
    desc: 'Setting up workspace...',
    enable: () => config.spaceKey,
    func: () => {
      return platformApi.setupWorkspace().then((res) => {
        if (res.code) {
          if (res.code === 403) {
            return platformApi.getUserProfile().then((userRes) => {
              if (userRes.code === 1000) {
                window.location.href = `/login?return_url=${window.location.href}`;
              } else if (userRes.code === 0) {
                return platformApi.fetchRequestState().then((stateRes) => {
                  initializeState.errorCode = res.code;
                  initializeState.status = stateRes.status;
                  return false;
                }).catch((catchRes) => {
                  if (catchRes.code === 404) {
                    initializeState.errorCode = catchRes.code;
                    initializeState.errorInfo = res.msg;
                  } else {
                    initializeState.errorCode = res.code;
                    initializeState.errorInfo = res.msg;
                  }
                  return false;
                });
              }
            })
          }
          initializeState.errorCode = res.code;
          initializeState.errorInfo = res.msg;
          return false;

        } else if (res.durationStatus === 'Temporary' && res.ttl <= 0) {
          initializeState.errorCode = 403;
          initializeState.status = 'Expired';
          return false;
        }

        // const clonedState =  this.waitTillCloned(res);
        // if (clonedState) return clonedState;

      // all
        extendObservable(config, res);
        if (config.project && config.project.name) { config.projectName = config.project.name; }

        // this.openInitFiles();
        return true;
      }).catch((res) => {
        if (res.msg) {
          initializeState.errorInfo = res.msg;
        }
        return false;
      });
    }
  },
  getGlobalKey: {
    desc: 'Get user globalKey -- platform',
    enable: config.isPlatform,
    func: () => {
      return platformApi.getUserProfile().then((res) => {
        const data = res.data;
        if (data) {
          config.globalKey = data.global_key;
          if (!/^(http|https):\/\/[^ "]+$/.test(data.avatar)) {
            data.avatar = `https://coding.net${data.avatar}`;
          }
          config.userProfile = data;
        }
        return true;
      });
    },
  },
  getSettings: {
    desc: 'Get workspace settings',
    func: () =>
      api.getSettings().then(settings => config.settings = settings)
  },
  connectSocket: {
    desc: 'Connect websocket',
    func: () => 
      api.connectWebsocketClient()
  },
  getProjectType: {
    desc: 'Estimate project type -- platform',
    enable: config.isPlatform,
    func: () => { platformApi.fetchProjectType(); return true; },
  },
  getStaticServingToken: {
    desc: 'Get static serving token',
    enable: config.isPlatform,
    func: () => {
      setTimeout(() => {
        platformApi.getStaticServingToken().then((res) => {
          const { host, token } = res;
          config.staticServingToken = token;
        });
      }, 1000);
      return true;
    },
  },
  preventAccidentalClose: {
    desc: 'Prevent accidental close',
    func: () => {
      window.onbeforeunload = function () {
        if (config.preventAccidentalClose) {
          return 'Do you really want to leave this site? Changes you made may not be saved.'
        }
        return void 0
      }
      return true
    }
  }
})

function insertFactory (beforeOrAfter) {
  return function insert (referKey, value) {
    const key = value.key || value.desc
    let entries = this.entries()
    let insertIndex = entries.findIndex(entry => entry[0] === referKey)
    if (insertIndex < 0) {
      entries = entries.concat([key, value])
    } else {
      if (beforeOrAfter === 'after') insertIndex += 1
      entries.splice(insertIndex, 0, [key, value])
    }
    this.replace(entries)
  }
}

stepCache.insertBefore = insertFactory('before')
stepCache.insertAfter = insertFactory('after')
stepCache.move = function (key, referKey, before = false) {
  const entries = this.entries()
  let insertIndex = entries.findIndex(entry => entry[0] === referKey)
  const currentIndex = entries.findIndex(entry => entry[0] === key)
  if (insertIndex < 0) return
  const value = stepCache.get(key)
  if (!before) insertIndex += 1
  // 删除当前
  entries.splice(currentIndex, 1)
  // 新位置后插入
  entries.splice(insertIndex, 0, [key, value])
  this.replace(entries)
}

export default stepCache
