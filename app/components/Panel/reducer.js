/* @flow weak */
import _ from 'lodash'
import { update } from '../../utils'
import { handleActions } from 'redux-actions'
import {
  PANEL_INITIALIZE,
  PANEL_RESIZE,
  PANEL_CONFIRM_RESIZE,
  PANEL_TOGGLE_LAYOUT,
  PANEL_REGISTER_VIEW,
  PANEL_ACTIVATE_VIEW,
} from './actions'

import {
  getPanel,
  getPrevSibling,
  getPanelByRef,
} from './selectors'

/**
 *  The state shape:
 *
 *  PanelState = {
      rootPanelId: PropTypes.string,
      panels: {
        [panel_id]: {
          id: PropTypes.string,
          flexDirection: PropTypes.string,
          size: PropTypes.number,
          position: PropTypes.string,
          parentId: PropTypes.string,
          views: PropTypes.arrayOf(PropTypes.string),
          contentType: PropTypes.string,
          disabled: PropTypes.bool,
          hide: PropTypes.bool,
        }
      }
    }
*/

// this can source from external config file or some API
const BasePanelLayout = {
  ref: 'ROOT',
  direction: 'column',
  views: [
    {ref: 'MENUBAR', contentType: 'MENUBAR', resizable: false, overflow: 'visible'},
    {ref: 'BAR_TOP', contentType: 'BREADCRUMBS', resizable: false, overflow: 'visible'},
    {
      ref: 'PRIMARY_ROW',
      direction: 'row',
      views: [
        {ref: 'BAR_LEFT', resizable: false},
        {
          ref: 'STAGE',
          direction: 'column',
          views: [
            {
              direction: 'row',
              views: [
                {ref: 'PANEL_LEFT', size: 20, contentType: 'PANEL_LEFT'},
                {ref: 'PANEL_CENTER', size: 80, contentType: 'PANES'},
                {ref: 'PANEL_RIGHT', size: 40, contentType: 'EXTENSION_RIGHT', hide: true},
              ],
              size: 75
            },
            {ref: 'PANEL_BOTTOM', size: 25, contentType: 'PANEL_BOTTOM', hide: false},
            {ref: 'BAR_BOTTOM', resizable: false, hide: false},
          ]
        },
        {ref: 'BAR_RIGHT', resizable: false, hide: false},
      ]
    },
    {ref: 'STATUSBAR', contentType: 'STATUSBAR', resizable: false, overflow: 'visible'},
  ]
}

const Panel = (panelConfig) => {
  const defaults = {
    id: _.uniqueId('panel_view_'),
    direction: 'row',
    size: 100,
    views: [],
    parentId: '',
    contentType: '',
    disableResizeBar: false,
    resizable: true,
  }

  let panel = { ...defaults, ...panelConfig }
  if (!panel.resizable) panel.disableResizeBar = true
  return panel
}

const constructPanelState = (state, panelConfig, parent) => {
  let nextState = state
  let views = panelConfig.views
  let panel = Panel({...panelConfig, views: []})

  if (parent) {
    panel.parentId = parent.id
    parent.views.push(panel.id)
  } else {
    nextState.rootPanelId = panel.id
  }
  nextState = update(nextState, {panels: {
    [panel.id]: { $set: panel }
  }})

  if (panel.ref) {
    nextState = update(nextState, {
      panelRefs: {
        [panel.ref]: { $set: panel.id }
      }
    })
  }

  if (!panel.resizable) {
    let prevSibling = getPrevSibling(nextState, panel)
    if (prevSibling) {
      prevSibling.disableResizeBar = true
      nextState = update(nextState, {panels: {
        [prevSibling.id]: { $set: prevSibling },
      }})
    }
  }

  if (views && views.length) {
    nextState = panelConfig.views.reduce((nextState, config) =>
      constructPanelState(nextState, config, panel)
    , nextState)
  }
  return nextState
}

let defaultState = {
  rootPanelId: '',
  panels: {},
  panelRefs: {},
  sidePanelViews: {
    left: {},
    right: {},
    bottom: {},
  },
}

defaultState = constructPanelState(defaultState, BasePanelLayout)


export default handleActions({
  [PANEL_TOGGLE_LAYOUT]: (state, action) => {
    const { selectors: { refs, ids }, shouldShow } = action.payload

    let selectedPanels = [].concat(
      refs ? refs.map(ref => getPanelByRef(state, ref)) : [],
      ids ? ids.map(id => getPanel(state, id)) : []
    )

    const panels = selectedPanels.reduce((acc, panel) => {
      const hideOrShow = typeof shouldShow === 'boolean' ? shouldShow : !panel.hide
      acc[panel.id] = { ...panel, hide: hideOrShow }
      return acc
    }, {})
    return update(state, { panels: {
      $merge: panels
    }})
  },

  [PANEL_CONFIRM_RESIZE]: (state, { payload: { leftView, rightView } }) => {
    return update(state, {
      panels: {
        [leftView.id]: { size: { $set: leftView.size } },
        [rightView.id]: { size: { $set: rightView.size } },
      }
    })
  },

  [PANEL_REGISTER_VIEW]: (state, { payload: { side, labels } }) => {
    return update(state, {
      sidePanelViews: {
        [side]: {
          labels: { $set: labels }
        }
      }
    })
  },

  [PANEL_ACTIVATE_VIEW]: (state, { payload: viewId }) => {
    const side = viewId.split('_')[0]
    return update(state, {
      sidePanelViews: {
        [side]: {
          activeViewId: { $apply: (curValue) => (curValue === viewId ? '' : viewId) }
        }
      }
    })
  }
}, defaultState)
