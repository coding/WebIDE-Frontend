/* eslint-disable no-await-in-loop */
import React from 'react'
import { isFunction, isBoolean, isString } from 'utils/is'
import config from '../config'
import api from '../backendAPI'
import { stepFactory } from '../utils'
import i18n from 'utils/createI18n'
import { loadPackagesByType, mountPackagesByType } from '../components/Plugins/actions'
import CodingSDK from '../CodingSDK'
import state from './state'
import { persistTask } from '../mobxStore'

function closestTo (arr, key, isPrev) {
  const offsetIndex = isPrev ? -1 : 1
  const current = arr.indexOf(key)
  return arr[current + offsetIndex]
}

function checkEnable (enable) {
  if (enable === undefined) {
    return true
  }
  if (isFunction(enable)) {
    return enable(config)
  }
  return Boolean(enable)
}

async function initialize () {
  const step = stepFactory()
  let stepNum = 2
  await step('[0] prepare data', async () => {
    window.CodingSDK = CodingSDK
    window.React = React
    window.i18n = i18n
    window.extension = f => null
    window.refs = {}
    window.config = config
    return true
  })

  // await step('[1] load required package', async() => {
  //   try {
  //     await loadPackagesByType('Required', state, true)
  //   } catch (err) {
  //     return true
  //   }
  //   return true
  // })

  await step('=== Run steps in stepCache ===', async() => {
    /*async function goto (key, hasNext = true) {
      if (!hasNext) {
        return true
      }
      const nextKey = await step(`[${stepNum++}] ${state.get(key).desc}`, state.get(key).func)
      if (nextKey === undefined || isBoolean(nextKey)) {
        const next = closestTo(state.keys(), key)
        return nextKey && goto(next, !!next)
      }
      if (isString(nextKey)) {
        return goto(nextKey)
      }
    }
    return goto(state.keys()[0])*/
    for (const value of state.values()) {
      if (checkEnable(value.enable)) {
        await step(`[${stepNum++}] ${value.desc}`, value.func)
      }
    }
    console.log('=== End running stepCache ===')
    return true
  })


  // await step(`[${stepNum++}] mount required package`, () => {
  //   mountPackagesByType('Required')
  //   return true
  // })

  // await step(`[${stepNum++}] persist Store`, () => {
  //   persistTask()
  //   return true
  // })

  if (config.packageDev) {
    await step(`[${stepNum++}] enable package server hotreload`,
    () => {
      const ports = __PACKAGE_PORTS__
      if (ports && ports.length) {
        ports.forEach((port) => {
          const url = `http://ide.test:${port}`
          api.enablePackageHotReload(url)
        })
      } else {
        api.enablePackageHotReload()
      }
      return true
    })
  }

  return step
}

export default initialize