import { autorunAsync, createTransformer, toJS as mobxToJS } from 'mobx'
import localforage from 'localforage'
import config from './config'
import { hydrate as editorTabHydrate } from './components/Tab/actions'
import { hydrate as settingsHydrate } from './components/Setting/state'
import { hydrate as pluginsHydrate } from './components/Plugins/actions'
import fileState, { hydrate as fileHydrate } from './commons/File/state'


const mainStore = localforage.createInstance({
  name: 'mainProject'
})

// store needed to persist
// the custom transform func
// the delay to set

function persistStore (store, transform) {
  autorunAsync(() => {
    const customTransform = transform || createTransformer(store => mobxToJS(store))
    const transformedStore = customTransform(store)
    // 初次等spacekey出现存
    if (config.spaceKey && !mainStore._config.storeName) {
      mainStore.config({ storeName: config.spaceKey })
    } else if (mainStore._config.storeName && (config.globalKey || !config.isPlatform)) {
      if (config.hasRehydrated) {
        mainStore.setItem(`${config.spaceKey}.${config.globalKey}`, transformedStore)
      } else {
        mainStore.getItem(`${config.spaceKey}.${config.globalKey}`).then((store) => {
          if (store) {
            autoRehydrate(store)
          }
          fileState.initData.set('_init', false)
          config.hasRehydrated = true
        })
      }
    }
  }, 200)
}

export const clearPersist = (key) => {
  if (!key) {
    mainStore.clear()
  } else {
    mainStore.removeItem(key)
  }
}

const hydrateAction = {
  FileState: fileHydrate,
  EditorTabState: editorTabHydrate,
  SettingState: settingsHydrate,
  PluginsState: pluginsHydrate
}

function autoRehydrate (store) {
  Object.keys(store).forEach((storeKey) => {
    if (hydrateAction[storeKey]) {
      hydrateAction[storeKey](store[storeKey])
    }
  })
}

window.clearPersist = clearPersist
export default persistStore
