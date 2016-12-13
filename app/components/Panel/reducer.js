/* @flow weak */
import _ from 'lodash'
import { update } from '../../utils'
import { handleActions } from 'redux-actions'
import {
  PANEL_INITIALIZE,
  PANEL_RESIZE,
  PANEL_CONFIRM_RESIZE
} from './actions'

import {
  getPrevSibling
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
          content: PropTypes.shape({
            type: PropTypes.string,
            id: PropTypes.string,
          })
        }
      }
    }
*/

// this can source from external config file or some API
const BasePanelLayout = {
  ref: 'ROOT',
  direction: 'column',
  views: [
    {ref: 'BAR_TOP_1', contentType: 'MENUBAR', resizable: false, overflow: 'visible'},
    {ref: 'BAR_TOP_2', contentType: 'BREADCRUMBS', resizable: false, overflow: 'visible'},
    {
      ref: 'PRIMARY_ROW',
      direction: 'row',
      views: [
        {ref: 'BAR_LEFT', resizable: false, hide: true},
        {
          ref: 'STAGE',
          direction: 'column',
          views: [
            {
              direction: 'row',
              views: [
                {ref: 'PANEL_LEFT', size: 20, contentType: 'FILETREE'},
                {ref: 'PANEL_CENTER', size: 80, contentType: 'PANES'},
                {ref: 'PANEL_RIGHT', size: 20, hide: true},
              ],
              size: 75
            },
            {ref: 'PANEL_BOTTOM', size: 25, hide: true},
            {ref: 'BAR_BOTTOM_2', resizable: false, hide: true},
          ]
        },
        {ref: 'BAR_RIGHT', resizable: false, hide: true},
      ]
    },
    {ref: 'BAR_BOTTOM_1', contentType: 'STATUSBAR', resizable: false, overflow: 'visible'},
  ]
}

const Panel = (panelConfig) => {
  const defaults = {
    id: _.uniqueId('panel_view_'),
    direction: 'row',
    size: 100,
    views: [],
    parentId: '',
    content: undefined,
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

const defaultState = constructPanelState({ panels: {} }, BasePanelLayout)


export default handleActions({

}, defaultState)
