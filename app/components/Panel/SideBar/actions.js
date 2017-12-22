import { registerAction } from 'utils/actions'
import { emitter, E } from 'utils'
import panelState from '../state'
import pluginState from '../../Plugins/store'
import { SIDEBAR } from '../../Plugins/constants'

export const SIDEBAR_ACTIVATE_VIEW = 'SIDEBAR_ACTIVATE_VIEW'
export const SIDEBAR_TOGGLE_VIEW = 'SIDEBAR_TOGGLE_VIEW'
export const SIDEBAR_SHOW_VIEW = 'SIDEBAR_SHOW_VIEW'
export const SIDEBAR_HIDE_VIEW = 'SIDEBAR_HIDE_VIEW'

const positionToPanel = {
  [SIDEBAR.RIGHT]: 'RIGHT',
  [SIDEBAR.LEFT]: 'LEFT',
  [SIDEBAR.BOTTOM]: 'BOTTOM',
}

const _toggleSidePanelView = (viewId, shouldShow) => {
  setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
  const targetPlugin = pluginState.plugins.get(viewId) || {}
  const targetPanel = panelState.panels.get(`PANEL_${positionToPanel[targetPlugin.position]}`)

  // 如果强制 show，或者当前 targetPlugin 不是 active 状态
  if (shouldShow || !targetPlugin.status.get('active')) {
    pluginState.plugins.forEach((plugin) => {
      if (plugin === targetPlugin) {
        plugin.status.set('active', true)
      } else if (plugin.position === targetPlugin.position) {
        plugin.status.set('active', false)
      }
    })
    targetPanel.show()
    emitter.emit(E.PANEL_SHOW, targetPanel)
    // 通知插件
    if (targetPlugin.actions.onSidebarActive) {
      targetPlugin.actions.onSidebarActive()
    }
  } else {
    targetPlugin.status.set('active', false)
    targetPanel.hide()
    emitter.emit(E.PANEL_HIDE, targetPanel)
    // 通知插件
    if (targetPlugin.actions.onSidebarDeactive) {
      targetPlugin.actions.onSidebarDeactive()
    }
  }
}

const _hideSidePanelView = (viewId) => {
  setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
  const targetPlugin = pluginState.plugins.get(viewId) || {}
  const targetPanel = panelState.panels.get(`PANEL_${positionToPanel[targetPlugin.position]}`)
  targetPlugin.status.set('active', false)
  targetPanel.hide()
  emitter.emit(E.PANEL_HIDE, targetPanel)
  // 通知插件
  if (targetPlugin.actions.onSidebarDeactive) {
    targetPlugin.actions.onSidebarDeactive()
  }
}

export const activateSidePanelView = registerAction(SIDEBAR_ACTIVATE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId, true)
})

export const hideSidePanelView = registerAction(SIDEBAR_HIDE_VIEW, (viewId) => {
  _hideSidePanelView(viewId)
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
