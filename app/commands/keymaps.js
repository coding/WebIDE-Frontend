import i18n from 'utils/createI18n'
import { observable } from 'mobx'
import { flattenKeyMaps } from './lib/helpers'

// Unavailable shortcuts: shift / ctrl + (q|n|w|t|↹)
const os = (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()
export const isMac = os === 'mac'

export const modifierKeysMap = isMac
  ? {
    ctrl: '⌃',
    alt: '⌥',
    cmd: '⌘',
    shift: '⇧'
  }
  : {
    ctrl: 'Ctrl',
    alt: 'Alt',
    cmd: 'Cmd',
    shift: 'Shift'
  }

const keymapStore = observable({
  systemKeymaps: [
    {
      command: 'file:new_file',
      mac: 'alt+n',
      win: 'alt+n',
      label: i18n`settings.keymap.createFile`
    },
    {
      command: 'file:new_folder',
      mac: 'alt+shift+n',
      win: 'alt+shift+n',
      label: i18n`settings.keymap.createFolder`
    },
    {
      command: 'file:save',
      mac: 'cmd+s',
      win: 'ctrl+s',
      label: i18n`settings.keymap.saveFile`
    },
    {
      command: 'modal:dismiss',
      mac: 'esc',
      win: 'esc',
      label: i18n`settings.keymap.exitModal`
    },
    {
      command: 'git:commit',
      mac: 'cmd+ctrl+c',
      win: 'ctrl+alt+c',
      label: i18n`settings.keymap.gitCommit`
    },
    {
      command: 'global:command_palette',
      mac: 'cmd+shift+p',
      win: 'ctrl+shift+p',
      label: i18n`settings.keymap.commandPalette`
    },
    {
      command: 'global:file_palette',
      mac: 'cmd+p',
      win: 'ctrl+p',
      label: i18n`settings.keymap.filePalette`
    },
    {
      command: 'global:show_settings',
      mac: 'cmd+,',
      win: 'alt+,',
      label: i18n`settings.keymap.showSettings`
    },
    {
      command: 'editor:goto',
      mac: 'cmd+g',
      win: 'ctrl+g',
      label: i18n`file.goto`
    },
    {
      command: 'edit:toggle_format_monaco',
      mac: 'alt+l',
      win: 'alt+l',
      label: i18n`settings.keymap.toggleFormat`
    },
    {
      command: 'edit:toggle_monaco_comment',
      mac: 'cmd+/',
      win: 'ctrl+/',
      label: i18n`settings.keymap.toggleComment`
    },
    {
      command: 'tab:zenmode',
      mac: 'cmd+f11',
      win: 'ctrl+f11',
      label: i18n`settings.keymap.into_zenmode`
    }
  ],
  pluginsKeymaps: [],
})

export default keymapStore

export const systemKeymaps = flattenKeyMaps(keymapStore.systemKeymaps)

export const pluginsKeymaps = keymapStore.pluginsKeymaps

export function getFlattenAllKeymaps () {
  return {
    ...flattenKeyMaps(keymapStore.systemKeymaps),
    ...flattenKeyMaps(
      keymapStore.pluginsKeymaps.map(km => km.keymaps).reduce((pre, cur) => {
        pre = [...pre, ...cur]
        return pre
      }, [])
    )
  }
}
