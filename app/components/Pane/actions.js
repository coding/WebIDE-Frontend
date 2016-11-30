/* @flow weak */
import { createAction } from 'redux-actions'
import { promiseActionMixin } from '../../utils'

export const PANE_INITIALIZE = 'PANE_INITIALIZE'
export const PANE_UNSET_COVER = 'PANE_UNSET_COVER'

export const PANE_SET_COVER = 'PANE_SET_COVER'
export const setCover = createAction(PANE_SET_COVER)

export const PANE_RESIZE = 'PANE_RESIZE'
export const resize = createAction(PANE_RESIZE,
  (sectionId, dX, dY) => ({sectionId, dX, dY})
)

export const PANE_CONFIRM_RESIZE = 'PANE_CONFIRM_RESIZE'
export const confirmResize = createAction(PANE_CONFIRM_RESIZE)

export const PANE_SPLIT_WITH_KEY = 'PANE_SPLIT_WITH_KEY'
export const split = createAction(PANE_SPLIT_WITH_KEY,
  (splitCount, flexDirection = 'row') => ({splitCount, flexDirection})
)

export const PANE_SPLIT = 'PANE_SPLIT'
export const splitTo = promiseActionMixin(
  createAction(PANE_SPLIT, (paneId, splitDirection) => ({paneId, splitDirection}))
)

export const startResize = (e, sectionId) => {
  console.log('startResize')
  return (dispatch, getState) => {
    if (e.button !== 0) return // do nothing unless left button pressed
    e.preventDefault()

    // dispatch(setCover(true))
    var [oX, oY] = [e.pageX, e.pageY]

    const handleResize = (e) => {
      var [dX, dY] = [oX - e.pageX, oY - e.pageY]
      ;[oX, oY] = [e.pageX, e.pageY]

      dispatch(resize(sectionId, dX, dY))
      // Array.isArray(resizingListeners) && resizingListeners.forEach(listener => listener())
    }

    const stopResize = () => {
      window.document.removeEventListener('mousemove', handleResize)
      window.document.removeEventListener('mouseup', stopResize)
      dispatch(confirmResize())
    }

    window.document.addEventListener('mousemove', handleResize)
    window.document.addEventListener('mouseup', stopResize)
  }
}

export const PANE_UPDATE = 'PANE_UPDATE'
export const updatePane = createAction(PANE_UPDATE)
