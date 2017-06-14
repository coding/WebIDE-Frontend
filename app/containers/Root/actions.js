// import { createAction } from 'redux-actions'
import config from '../../config'
import ide from '../../IDE'
import { qs } from 'utils'

// initAppState
export const INIT_STATE = 'INIT_STATE'
export const initState = () => (dispatch) => {
  if (config.isPlatform) {
    const urlPath = window.location.pathname
    const queryEntryPathPattern = /^\/ws\/?$/
    const wsPathPattern = /^\/ws\/([^\/]+)$/
    const isFromQueryEntryPath = queryEntryPathPattern.test(urlPath)
    let spaceKey = null
    const match = wsPathPattern.exec(urlPath)
    if (match) {
      spaceKey = match[1]
      config.spaceKey = spaceKey
    }
  } else {
    const { spaceKey } = qs.parse(window.location.hash.slice(1))
    if (spaceKey) config.spaceKey = spaceKey
  }
  window.ide = ide
  dispatch({ type: INIT_STATE })
}
