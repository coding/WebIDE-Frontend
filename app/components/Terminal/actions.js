import { registerAction } from 'utils/actions'
import state, { Tab, TabGroup } from './state'

/*
 * Old API copied from v1
 * currently not used, just keep as a reminder
 *
export const TERM_CLOSE = 'TERM_CLOSE'
export function close (tabId) {
  return {
    type: TERM_CLOSE,
    tabId
  }
}

export const TERM_CLOSE_ALL = 'TERM_CLOSE_ALL'
export function closeAll () {
  return {
    type: TERM_CLOSE_ALL
  }
}

export const TERM_OPEN = 'TERM_OPEN'
export function open () {
  return {
    type: TERM_OPEN
  }
}

export const TERM_ACTIVE = 'TERM_ACTIVE'
export function active (tabId) {
  return {
    type: TERM_ACTIVE,
    tabId
  }
}

export const TERM_TITLE = 'TERM_TITLE'
export function setTitle (tabId, title) {
  return {
    type: TERM_TITLE,
    tabId,
    title
  }
}

export const TERM_LAYOUT = 'TERM_LAYOUT'
export function layout () {
  return {
    type: TERM_LAYOUT
  }
}

export const TERM_ONLINE = 'TERM_ONLINE'
export function setOnline (online) {
  return {
    type: TERM_ONLINE,
    online
  }
}

export const TERM_RECONNECT = 'TERM_RECONNECT'
export function setReconnect (reconnect) {
  return {
    type: TERM_RECONNECT,
    reconnect
  }
}

export const TERM_CLEAR_BUFFER = 'TERM_CLEAR_BUFFER'
export function clearBuffer () {
  return {
    type: TERM_CLEAR_BUFFER
  }
}

export const TERM_CLEAR_SCROLLBACK_BUFFER = 'TERM_CLEAR_SCROLLBACK_BUFFER'
export function clearScrollbackBuffer () {
  return {
    type: TERM_CLEAR_SCROLLBACK_BUFFER
  }
}

export const TERM_RESET = 'TERM_RESET'
export function reset () {
  return {
    type: TERM_RESET
  }
}

export const TERM_INPUT = 'TERM_INPUT'
export function input (inputString) {
  return {
    type: TERM_INPUT,
    inputString
  }
}

export const TERM_INPUT_PATH = 'TERM_INPUT_PATH'
export function inputPath (inputPath) {
  return {
    type: TERM_INPUT_PATH,
    inputPath
  }
}
*/

export const addTerminal = registerAction('terminal:add', (props) => {
  const group = state.tabGroups.get('terminalGroup')
  if (!group.tabs.find(tab => tab.id === props.id)) {
    group.addTab(new Tab(props))
  }
})

// 如果没有，添加一个
export const openTerminal = registerAction('terminal:open', () => {
  const terminalTabGroup = state.tabGroups.get('terminalGroup')
  if (terminalTabGroup.tabs.length === 0) {
    state.tabGroups.get('terminalGroup').addTab(new Tab())
  }
})

export const removeTerminal = registerAction('terminal:remove', (tabId) => {
  state.tabGroups.get('terminalGroup').removeTab(tabId)
})
