// Unavailable shortcuts: shift / ctrl + (q|n|w|t|↹)
const os = (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()
export const isMac = (os === 'mac')

let keymaps
let modifierKeysMap
if (isMac) {
  keymaps = {
    'alt+n': 'file:new_file',
    'alt+shift+n': 'file:new_folder',
    'cmd+s': 'file:save',
    'cmd+ctrl+c': 'git:commit',
    'esc': 'modal:dismiss',
    'cmd+shift+p': 'global:command_palette',
    'cmd+p': 'global:file_palette',
    'cmd+alt+1': 'editor:split_pane_1',
    'cmd+alt+shift+1': 'editor:split_pane_1',
    'cmd+alt+2': 'editor:split_pane_vertical_2',
    'cmd+alt+shift+2': 'editor:split_pane_horizontal_2',
    'cmd+alt+3': 'editor:split_pane_vertical_3',
    'cmd+alt+shift+3': 'editor:split_pane_horizontal_3',
    'cmd+alt+4': 'editor:split_pane_vertical_4',
    'cmd+,': 'global:show_settings',
    'ctrl+g': 'editor:goto',
  }
  modifierKeysMap = {
    ctrl: '⌃',
    alt: '⌥',
    cmd: '⌘',
    shift: '⇧',
  }
} else {
  keymaps = {
    'alt+n': 'file:new_file',
    'alt+shift+n': 'file:new_folder',
    'ctrl+s': 'file:save',
    'ctrl+alt+c': 'git:commit',
    'esc': 'modal:dismiss',
    'ctrl+shift+p': 'global:command_palette',
    'ctrl+p': 'global:file_palette',
    'ctrl+alt+1': 'editor:split_pane_1',
    'ctrl+alt+shift+1': 'editor:split_pane_1',
    'ctrl+alt+2': 'editor:split_pane_vertical_2',
    'ctrl+alt+shift+2': 'editor:split_pane_horizontal_2',
    'ctrl+alt+3': 'editor:split_pane_vertical_3',
    'ctrl+alt+shift+3': 'editor:split_pane_horizontal_3',
    'ctrl+alt+4': 'editor:split_pane_vertical_4',
    'alt+,': 'global:show_settings',
    'ctrl+g': 'editor:goto',
  }
  modifierKeysMap = {
    ctrl: 'Ctrl',
    alt: 'Alt',
    cmd: 'Cmd',
    shift: 'Shift',
  }
}

export default keymaps

export {
  modifierKeysMap
}
