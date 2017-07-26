import { registerAction } from 'utils/actions'
import { emitter, E } from 'utils'


import state from './state'
import panelState from '../state'

export const SIDEBAR_REGISTER_VIEW = 'SIDEBAR_REGISTER_VIEW'
export const SIDEBAR_ACTIVATE_VIEW = 'SIDEBAR_ACTIVATE_VIEW'
export const SIDEBAR_TOGGLE_VIEW = 'SIDEBAR_TOGGLE_VIEW'

/*
side bar api
* side bar state shape
  labels: { // map格式，observable
          //  sideBar label
          [viewId]:
            key, // 业务名 required
            viewId, // 视图名 optional defatult: {side_key_instanceId}
            text,   // 标签元素 optional
            icon, // 标签图标 optional
            instanceId, // component 的 实例名 optional
            onSidebarActive: func, // side bar 激活通知
            onSidebarDeactive: func, // side bar 隐藏通知
            weight: number // control the view order // 排序序号 optional
            isActive: bool // 是否默认开启
           },
  },
  activeStatus: { observable，普通object
    left: '', // 不同 side 当前激活情况
  },
  views: { // component cache，根据 viewid 去查
      [viewId]: {view} component
  }
*/

/**
 * @param  {} registerSideBarView
 * @param  {} (children
 * @param  {} =>{constchildrenArray=Array.isArray(children
 * @param  {[children]childrenArray.forEach((child} ?children
 */
export const registerSideBarView = registerAction(SIDEBAR_REGISTER_VIEW,
  (children) => {
    // 可支持数组批量注册，或单个孩子
    const childrenArray = Array.isArray(children) ? children : [children]
    childrenArray.forEach((child) => {
      const { side, key, label, viewId, view, isActive, instanceId } = child
      const generateViewId = viewId || `${side}_${key}${instanceId ? `_${instanceId}` : ''}`
      if (isActive) {
        state.activeStatus.set(side, generateViewId)
      }
      state.labels.set(generateViewId, {
        viewId: generateViewId,
        key,
        ...label
      })
      state.views[generateViewId] = view
    })
  }
)

// API：单个 component 注入到 sideBar
/**
 * @param  {} side 所在 side 名称
 * @param  {} label label 相关信息
 * @param  {} getComponent 根据信息获取
 * @param  {} return registerSideBarView({side
 * @param  {} key
 * @param  {} label
 * @param  {} view}
 */
export const addComToSideBar = (side, label, getComponent) => {
  const key = label.key
  const view = label.key && window.extensions[label.key] && getComponent(window.extensions[label.key])
  return registerSideBarView({
    side,
    key,
    label,
    view
  })
}


const _toggleSidePanelView = (viewId, shouldShow) => {
  setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
  const side = viewId.split('_')[0]
  const currentLabel = state.labels.get(viewId)
  const targetPanel = panelState.panels.get(`PANEL_${side.toUpperCase()}`)
  shouldShow = Boolean(shouldShow) || state.activeStatus.get(side) === viewId
//   需要隐藏
  if (shouldShow) {
    state.activeStatus.set(side, '')
    targetPanel.hide = true
    // 通知插件
    if (currentLabel && currentLabel.onSidebarDeactive) {
      currentLabel.onSidebarDeactive()
    }
  } else {
    state.activeStatus.set(side, viewId)
    targetPanel.hide = false
        // 通知插件
    if (currentLabel && currentLabel.onSidebarActive) {
      currentLabel.onSidebarActive()
    }
  }
}

export const activateSidePanelView = registerAction(SIDEBAR_ACTIVATE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId, true)
})

export const toggleSidePanelView = registerAction(SIDEBAR_TOGGLE_VIEW, (viewId) => {
  _toggleSidePanelView(viewId)
})
