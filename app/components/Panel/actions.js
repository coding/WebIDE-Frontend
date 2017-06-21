// import { createAction } from 'redux-actions'
import { createAction, registerAction } from 'utils/actions'
import { emitter, E } from 'utils'
import state from './state'

export const PANEL_CONFIRM_RESIZE = 'PANEL_CONFIRM_RESIZE'
export const confirmResize = registerAction(PANEL_CONFIRM_RESIZE,
  (leftViewId, leftSize, rightViewId, rightSize) => ({
    leftView: { id: leftViewId, size: leftSize },
    rightView: { id: rightViewId, size: rightSize },
  }),
  ({ leftView, rightView }) => {
    state.panels.get(leftView.id).size = leftView.size
    state.panels.get(rightView.id).size = rightView.size
  }
)

export const PANEL_TOGGLE_LAYOUT = 'PANEL_TOGGLE_LAYOUT'
export const togglePanelLayout = registerAction(PANEL_TOGGLE_LAYOUT,
  (selectors, shouldShow) => ({ selectors, shouldShow }),
  ({ selectors, shouldShow }) => {
    const selectedPanels = selectors.map(panelId => state.panels.get(panelId))
    selectedPanels.forEach((panel) => {
      if (shouldShow === undefined) shouldShow = panel.hide
      panel.hide = !shouldShow
    })
  }
)

export const PANEL_REGISTER_VIEW = 'PANEL_REGISTER_VIEW'
export const registerSidePanelView = registerAction(PANEL_REGISTER_VIEW,
  ({ side, labels, activeViewId }) => {
    state.sidePanelViews[side] = { labels, activeViewId }
  }
)

const _toggleSidePanelView = (viewId, shouldShow) => {
  emitter.emit(E.PANEL_RESIZED)
  const side = viewId.split('_')[0]
  const activeViewId = state.sidePanelViews[side].activeViewId

  if (shouldShow === undefined) {
    if (activeViewId === viewId) viewId = ''
    shouldShow = Boolean(viewId)
  }

  const targetPanel = state.panels.get(`PANEL_${side.toUpperCase()}`)
  targetPanel.hide = !shouldShow
  state.sidePanelViews[side].activeViewId = viewId
}

export const PANEL_ACTIVATE_VIEW = 'PANEL_ACTIVATE_VIEW'
export const activateSidePanelView = registerAction(PANEL_ACTIVATE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId, true)
})

export const PANEL_TOGGLE_VIEW = 'PANEL_TOGGLE_VIEW'
export const toggleSidePanelView = registerAction(PANEL_TOGGLE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId)
})
