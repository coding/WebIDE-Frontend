/* @flow weak */
import { dispatch as $d } from '../../store'
import store from 'mobxStore'
import * as Tab from 'components/Tab/actions'
import * as PaneActions from 'components/Pane/actions'

export default {
  'tab:close': (c) => {
    Tab.removeTab(c.context.id)
  },

  'tab:close_other': (c) => {
    Tab.removeOtherTab(c.context.id)
  },

  'tab:close_all': (c) => {
    Tab.removeAllTab(c.context.id)
  },

  'tab:split_v': (c) => {
    const panes = store.PaneState.panes
    const pane = panes.values().find(pane => (
      pane.content && pane.content.type === 'tabGroup' && pane.content.id === c.context.tabGroupId
    ))
    $d(PaneActions.splitTo(pane.id, 'bottom'))
      .then((newPaneId) => {
        $d(Tab.moveTabToPane(c.context.id, newPaneId))
      })
  },

  'tab:split_h': (c) => {
    const panes = store.getState().PaneState.panes
    const pane = Object.values(panes).find(pane => (
      pane.content && pane.content.type === 'tabGroup' && pane.content.id === c.context.tabGroupId
    ))
    $d(PaneActions.splitTo(pane.id, 'right'))
      .then((newPaneId) => {
        $d(Tab.moveTabToPane(c.context.id, newPaneId))
      })
  },
}
