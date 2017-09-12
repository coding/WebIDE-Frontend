import * as Modal from 'components/Modal/actions'
import * as Panel from 'components/Panel/actions'
import * as SideBar from 'components/Panel/SideBar/actions'
import terminalState from 'components/Terminal/state'
import * as Terminal from 'components/Terminal/actions'

const getComponentByName = name => window.refs[name].getWrappedInstance()
export default {
  'global:command_palette': (c) => {
    Modal.showModal('CommandPalette')
  },

  'global:file_palette': (c) => {
    Modal.showModal('FilePalette')
  },

  'global:show_settings': (c) => {
    Modal.showModal({ type: 'Settings', position: 'center' })
  },
  'global:show_branches': () => {
    getComponentByName('GitBranchWidget').toggleActive(true)
  },
  'modal:dismiss': (c) => {
    Modal.dismissModal()
  },
  'view:toggle_bars': (c) => {
    Panel.togglePanelLayout(['BAR_LEFT', 'BAR_RIGHT', 'BAR_BOTTOM'])
  },
  // 'view:close_tab':
  // 'view:toggle_statusbar':
  // 'view:toggle_filetree':

  // 'tools:terminal:clear_buffer':
  // 'tools:terminal:clear_scrollback_buffer':
  // 'tools:terminal:reset':
  'tools:terminal:new_terminal': (c) => {
    const terminalGroup = terminalState.tabGroups.get('terminalGroup')
    if (terminalGroup) {
      Terminal.addTerminal()
    }
    SideBar.activateSidePanelView('SIDEBAR.BOTTOM.terminal')
    // $d(Tab.createTabInGroup('tab_group_terminal'))
  }
}
