/* @flow weak */
import store, { dispatch as $d } from '../../store'
import * as Tab from 'commons/Tab/actions'
import * as PaneActions from '../../components/Pane/actions'

export default {
  'tab:close': c => {
    $d(Tab.removeTab(c.context.id))
  },

  'tab:close_other': c => {
    $d(Tab.removeOtherTab(c.context.id))
  },

  'tab:close_all': c => {
    $d(Tab.removeAllTab(c.context.id))
  },

  'tab:split_v': c => {
    const panes = store.getState().PaneState.panes
    const pane = Object.values(panes).find((pane) => (
      pane.content && pane.content.type === 'tabGroup' && pane.content.id === c.context.tabGroupId
    ))
    $d(PaneActions.splitTo(pane.id, 'bottom'))
      .then(newPaneId => {
        $d(Tab.moveTabToPane(c.context.id, newPaneId))
      })
  },

  'tab:split_h': c => {
    const panes = store.getState().PaneState.panes
    const pane = Object.values(panes).find((pane) => (
      pane.content && pane.content.type === 'tabGroup' && pane.content.id === c.context.tabGroupId
    ))
    $d(PaneActions.splitTo(pane.id, 'right'))
      .then(newPaneId => {
        $d(Tab.moveTabToPane(c.context.id, newPaneId))
      })
  },
}
