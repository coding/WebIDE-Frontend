import { registerAction } from 'utils/actions'
import { emitter, E } from 'utils'
import panelState from '../state'
import pluginState from '../../Plugins/store'
import { SIDEBAR } from '../../Plugins/constants'

export const SIDEBAR_ACTIVATE_VIEW = 'SIDEBAR_ACTIVATE_VIEW'
export const SIDEBAR_TOGGLE_VIEW = 'SIDEBAR_TOGGLE_VIEW'
export const SIDEBAR_SHOW_VIEW = 'SIDEBAR_SHOW_VIEW'


const positionToPanel = {
  [SIDEBAR.RIGHT]: 'RIGHT',
  [SIDEBAR.LEFT]: 'LEFT',
  [SIDEBAR.BOTTOM]: 'BOTTOM',
}

const _toggleSidePanelView = (viewId, shouldShow) => {
  setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
  const targetPlugin = pluginState.plugins.get(viewId) || {}

  const targetPanel = panelState.panels.get(`PANEL_${positionToPanel[targetPlugin.position]}`)
  // 当前状态
  shouldShow = Boolean(shouldShow) || targetPlugin.status.get('active')
//   需要隐藏
  if (shouldShow) {
    targetPlugin.status.set('active', false)
    targetPanel.hide = true
    // 通知插件
    if (targetPlugin.actions.onSidebarDeactive) {
      targetPlugin.actions.onSidebarDeactive()
    }
  } else {
    pluginState.plugins.forEach((plugin) => {
      if (plugin.position === targetPlugin.position) {
        plugin.status.set('active', false)
      }
    })
    targetPlugin.status.set('active', true)
    targetPanel.hide = false
        // 通知插件
    if (targetPlugin.actions.onSidebarActive) {
      targetPlugin.actions.onSidebarActive()
    }
  }
}

export const activateSidePanelView = registerAction(SIDEBAR_ACTIVATE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId, true)
})

export const showSidePanelView = registerAction(SIDEBAR_SHOW_VIEW, ({ viewId, shouldShow }) => {
  const plugin = pluginState.plugins.get(viewId)
  if (shouldShow) {
    plugin.status.set('active', true)
  }
  if (!shouldShow) {
    plugin.status.set('active', false)
  }
})


export const toggleSidePanelView = registerAction(SIDEBAR_TOGGLE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId)
})
