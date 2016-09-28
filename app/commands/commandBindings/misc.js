/* @flow weak */
import store from '../../store'
const { getState, dispatch: $d } = store

import api from '../../api'
import * as Modal from '../../components/Modal/actions'

export default {
  'global:command_palette': c => {
    $d(Modal.showModal('CommandPalette'))
  },

  'modal:dismiss': (c) => {
    $d(Modal.dismissModal())
  }
  // 'view:close_tab':
  // 'view:toggle_statusbar':
  // 'view:toggle_filetree':

  // 'tools:terminal:clear_buffer':
  // 'tools:terminal:clear_scrollback_buffer':
  // 'tools:terminal:reset':
  // 'tools:terminal:new_terminal':
}
