import { dispatch as $d } from '../../store'
import store from 'mobxStore'
import * as Tab from 'components/Tab/actions'
import * as PaneActions from 'components/Pane/actions'

export default {
  'tab:close': (c) => {
    Tab.removeTab(c.context)
  },

  'tab:close_other': (c) => {
    Tab.removeOtherTab(c.context)
  },

  'tab:close_all': (c) => {
    Tab.removeAllTab(c.context)
  },

  'tab:split_v': (c) => {
    const panes = store.PaneState.panes
    const pane = panes.values().find(pane =>
      pane.contentId === c.context.tabGroupId
    )
    PaneActions.splitTo(pane.id, 'bottom').then(newPaneId =>
      Tab.moveTabToPane(c.context.id, newPaneId)
    )
  },

  'tab:split_h': (c) => {
    const panes = store.PaneState.panes
    const pane = panes.values().find(pane =>
      pane.contentId === c.context.tabGroupId
    )
    PaneActions.splitTo(pane.id, 'right').then(newPaneId =>
      Tab.moveTabToPane(c.context.id, newPaneId)
    )
  },
}
