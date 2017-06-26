import { registerAction } from 'utils/actions'
import state, { Pane } from './state'
import mobxStore from '../../mobxStore'

const moveTabToPane = (tabId, paneId) => {
  const pane = mobxStore.PaneState.panes.get(paneId)
  const tab = mobxStore.EditorTabState.tabs.get(tabId)
  tab.tabGroup.removeTab(tab)
  pane.tabGroup.addTab(tab)
}

export const PANE_CONFIRM_RESIZE = 'PANE_CONFIRM_RESIZE'
export const confirmResize = registerAction(PANE_CONFIRM_RESIZE,
  (leftViewId, leftSize, rightViewId, rightSize) => ({
    leftView: { id: leftViewId, size: leftSize },
    rightView: { id: rightViewId, size: rightSize },
  }),
  ({ leftView, rightView }) => {
    state.panes[leftView.id].size = leftView.size
    state.panes[rightView.id].size = rightView.size
  }
)

export const PANE_SPLIT = 'PANE_SPLIT'
export const splitTo = registerAction(PANE_SPLIT,
  (paneId, splitDirection, tabId) => ({ paneId, splitDirection, tabId }),
  ({ paneId, splitDirection, tabId }, action) => {
    const pane = state.panes.get(paneId)
    /* ----- */
    let flexDirection, newPane
    if (splitDirection === 'center') {
      // no pane arrangement changed, so no state change
      action.meta.resolve(pane.id)
      moveTabToPane(tabId, pane.id)
      return state
    }
    switch (splitDirection) {
      case 'right':
      case 'left':
        flexDirection = 'row'
        break
      case 'top':
      case 'bottom':
        flexDirection = 'column'
        break
      default:
        throw Error('Pane.splitToDirection method requires param "splitDirection"')
    }

    const parent = pane.parent
    // If flexDirection is same as parent's,
    // then we can simply push the newly splitted view into parent's "views" array
    // debugger
    if (parent && parent.flexDirection === flexDirection) {
      newPane = new Pane({ parentId: parent.id })
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        // return _addSiblingAfterPane(state, pane, newPane)
        newPane.index = pane.index + 0.5
      } else {
        newPane.index = pane.index - 0.5
      }
      action.meta.resolve(newPane.id)
      moveTabToPane(tabId, newPane.id)
    // If flexDirection is NOT the same as parent's,
    // that means we should spawn a child pane
    } else {
      pane.flexDirection = flexDirection
      const spawnedChild = new Pane({ parentId: pane.id, contentId: pane.contentId })
      pane.contentId = null
      newPane = new Pane({ parentId: pane.id })
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        spawnedChild.index = 0
        newPane.index = 1
      } else {
        spawnedChild.index = 1
        newPane.index = 0
      }
      action.meta.resolve(newPane.id)
      moveTabToPane(tabId, newPane.id)
    }
  }
)

export const split = registerAction('PANE_SPLIT_WITH_KEY',
  (splitCount, flexDirection = 'row') => ({ splitCount, flexDirection }),
  f => f
)

export const PANE_UPDATE = 'PANE_UPDATE'
export const updatePane = registerAction(PANE_UPDATE, ({ id: paneId, tabGroupId }) => {
  const pane = state.panes.get(paneId)
  pane.contentId = tabGroupId
})

export const PANE_CLOSE = 'PANE_CLOSE'
export const closePane = registerAction(PANE_CLOSE, (paneId) => {
  const pane = state.panes.get(paneId)
  pane.destroy()
})
