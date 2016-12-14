/* @flow weak */
import store from '../../store'
const { getState, dispatch: $d } = store

import api from '../../backendAPI'
import * as Modal from '../../components/Modal/actions'
import * as Panel from '../../components/Panel/actions'

export default {
  'global:command_palette': c => {
    $d(Modal.showModal('CommandPalette'))
  },

  'global:show_settings': c => {
    $d(Modal.showModal({type: 'Settings', position: 'center'}))
  },
  'global:show_extensions': c => {
    $d(Modal.showModal({type: 'Extensions', position: 'center'}))
  },
  'modal:dismiss': c => {
    $d(Modal.dismissModal())
  },
  'view:toggle_bars': c => {
    $d(Panel.togglePanelLayout({refs: ['BAR_LEFT', 'BAR_RIGHT', 'BAR_BOTTOM']}))
  }
  // 'view:close_tab':
  // 'view:toggle_statusbar':
  // 'view:toggle_filetree':

  // 'tools:terminal:clear_buffer':
  // 'tools:terminal:clear_scrollback_buffer':
  // 'tools:terminal:reset':
  // 'tools:terminal:new_terminal':
}
