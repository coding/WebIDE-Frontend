import { autorun, createTransformer, toJS as mobxToJS } from 'mobx'
import localforage from 'localforage'
import config from './config'
import { hydrate as editorTabHydrate } from './components/Tab/actions'
import { hydrate as settingsHydrate } from './components/Setting/state'

const mainStore = localforage.createInstance({
  name: 'mainProject'
})

// store needed to persist
// the custom transform func
// the delay to set

function persistStore (store, transform) {
  autorun(() => {
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
          config.hasRehydrated = true
        })
      }
    }
  })
}

const hydrateAction = {
  EditorTabState: editorTabHydrate,
  SettingState: settingsHydrate
}

function autoRehydrate (store) {
  Object.keys(store).forEach((storeKey) => {
    if (hydrateAction[storeKey]) {
      hydrateAction[storeKey](store[storeKey])
    }
  })
}
export default persistStore
