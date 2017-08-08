/* eslint-disable no-await-in-loop */
import React from 'react'
import { isFunction } from 'utils/is'
import config from '../config'
import api from '../backendAPI'
import { stepFactory, i18n } from '../utils'
import { loadPackagesByType, mountPackagesByType } from '../components/Plugins/actions'
import CodingSDK from '../CodingSDK'
import state from './state'

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

  await step('[1] load initialize package', async() => {
    await loadPackagesByType('init', state)
    return true
  })

  await step('load step from settings', async() => {
    for (const value of state.values()) {
      if (checkEnable(value.enable)) {
        await step(`[${stepNum++}] ${value.desc}`, value.func)
      }
    }
    return true
  })


  await step(`[${stepNum++}] load required package`,
  async () => {
    await loadPackagesByType('Required')
    mountPackagesByType('init')
    return true
  })

  if (config.packageDev) {
    await step(`[${stepNum++}] enable package server hotreload`,
    () => {
      api.enablePackageHotReload()
      return true
    })
  }

  return step
}

export default initialize
