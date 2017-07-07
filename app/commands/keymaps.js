// Unavailable shortcuts: shift / ctrl + (q|n|w|t|↹)
export default {
  'alt+n': 'file:new_file',
  'alt+shift+n': 'file:new_folder',
  'cmd+s': 'file:save',
  //'cmd+shift+c': 'git:commit',
  esc: 'modal:dismiss',
  'cmd+shift+p': 'global:command_palette',
  'cmd+p': 'global:file_palette',
  'cmd+alt+1': 'editor:split_pane_1',
  'cmd+alt+shift+1': 'editor:split_pane_1',
  'cmd+alt+2': 'editor:split_pane_vertical_2',
  'cmd+alt+shift+2': 'editor:split_pane_horizontal_2',
  'cmd+alt+3': 'editor:split_pane_vertical_3',
  'cmd+alt+shift+3': 'editor:split_pane_horizontal_3',
  'cmd+alt+4': 'editor:split_pane_vertical_4',
  'cmd+comma': 'global:show_settings',
  'alt+b': 'global:show_branches',
}

export const modifierKeysMap = {
  control: '＾',
  alt: '⌥',
  cmd: '⌘',
  comma: ',',
  shift: '⇧',
}
