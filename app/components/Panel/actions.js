import { registerAction } from 'utils/actions'
import _ from 'lodash'
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

export const PRIMIARY_PANEL_BLUR_CONTROLER = 'PRIMIARY_PANEL_BLUR_CONTROLER'

export const primiaryPanelBlurControler = registerAction(PRIMIARY_PANEL_BLUR_CONTROLER,
(shouldShow) => {
  state.primaryPanelAxis.blur = shouldShow
})

