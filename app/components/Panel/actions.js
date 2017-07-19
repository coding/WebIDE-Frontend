// import { createAction } from 'redux-actions'
import { createAction, registerAction } from 'utils/actions'
import { emitter, E } from 'utils'
import _ from 'lodash'
import update from '../../utils/immutableUpdate'
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


/* shape of label
label = {
  text: String,
  icon: String,
  viewId: String,
  key: String, // plugin unique key
  onSidebarActive: func,
  onSidebarDeactive: func
}
*/
export const PANEL_REGISTER_VIEW = 'PANEL_REGISTER_VIEW'
// 根据viewid去重，防止相同viewid的汇聚
update.extend('$mergeByViewId', (array, original) => {
  const isArray = _.isArray(array) ? array : [array]
  if (!original) return isArray
  return _(original)
  .keyBy('viewId')
  .merge(_.keyBy(isArray, 'viewId'))
  .values()
  .value()
})
export const registerSidePanelView = registerAction(PANEL_REGISTER_VIEW,
  ({ side, labels, activeViewId, views }) => {
    state.sidePanelViews[side] = update(state.sidePanelViews[side], {
      labels: { $mergeByViewId: labels },
      activeViewId: { $set: activeViewId },
      views: { $concat: views },
    })
  }
)

export const addComToSideBar = (side, label, getComponent) => {
  const current = state.sidePanelViews[side]
  const currentMaxIndex = current.labels && (current.labels.length ? current.labels.length : 0)
  // 如有相同key，则viewid不变，key 为插件唯一变识
  const dupLabel = (current.labels && current.labels.find(currentLabel => currentLabel.key && currentLabel.key === label.key)) || {}
  const dupLabelIndex = dupLabel.viewId && dupLabel.viewId.split('_')[1]
  const viewId = `${side}_${dupLabelIndex || currentMaxIndex}`
  const labelWithViewid = { ...label, viewId }
  return registerSidePanelView({
    side,
    labels: [labelWithViewid],
    views: [() => label.key && window.extensions[label.key] && getComponent(window.extensions[label.key])]
  })
}


const _toggleSidePanelView = (viewId, shouldShow) => {
  emitter.emit(E.PANEL_RESIZED)
  const side = viewId.split('_')[0]
  const activeViewId = state.sidePanelViews[side].activeViewId
  const labels = state.sidePanelViews[side].labels
  const currentLabel = labels.find(label => label.viewId === viewId)

  if (shouldShow === undefined) {
    if (activeViewId === viewId) {
      viewId = ''
      if (currentLabel && currentLabel.onSidebarDeactive) {
        currentLabel.onSidebarDeactive()
      }
    } else if (currentLabel && currentLabel.onSidebarActive) {
      currentLabel.onSidebarActive()
    }
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
