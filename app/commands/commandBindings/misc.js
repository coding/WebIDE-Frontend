/* @flow weak */
import store from '../../store'
const { getState, dispatch: $d } = store

import * as Modal from '../../components/Modal/actions'
import * as Panel from '../../components/Panel/actions'
import * as Tab from '../../components/Tab/actions'

const getComponentByName = name => window.refs[name].getWrappedInstance();
export default {
  'global:command_palette': c => {
    $d(Modal.showModal('CommandPalette'))
  },

  'global:file_palette': c => {
    $d(Modal.showModal('FilePalette'))
  },

  'global:show_settings': c => {
    $d(Modal.showModal({type: 'Settings', position: 'center'}))
  },
  'global:show_branches': () => {
    getComponentByName('GitBranchWidget').openGitBranches()
  },
  'modal:dismiss': c => {
    $d(Modal.dismissModal())
  },
  'view:toggle_bars': c => {
    $d(Panel.togglePanelLayout({refs: ['BAR_LEFT', 'BAR_RIGHT', 'BAR_BOTTOM']}))
  },
  // 'view:close_tab':
  // 'view:toggle_statusbar':
  // 'view:toggle_filetree':

  // 'tools:terminal:clear_buffer':
  // 'tools:terminal:clear_scrollback_buffer':
  // 'tools:terminal:reset':
  'tools:terminal:new_terminal': c => {
    $d(Panel.activateSidePanelView('bottom_0'))
    $d(Tab.createTabInGroup('tab_group_terminal'))
  }
}
