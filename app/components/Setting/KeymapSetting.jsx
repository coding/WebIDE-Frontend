import React from 'react'
import { observer } from 'mobx-react'
import i18n from 'utils/createI18n'
import keymapStore from 'commands/keymaps'

import FormInputGroup from './FormInputGroup'

const keymaps = [
  { id: 0, cmd: i18n`settings.keymap.createFile`, mac: ['alt', 'n'], win: ['alt', 'n'] },
  { id: 1, cmd: i18n`settings.keymap.createFolder`, mac: ['alt', 'shift', 'n'], win: ['alt', 'shift', 'n'] },
  { id: 2, cmd: i18n`settings.keymap.saveFile`, mac: ['cmd', 's'], win: ['ctrl', 's'] },
  { id: 3, cmd: i18n`settings.keymap.gitCommit`, mac: ['cmd', 'ctrl', 'c'], win: ['ctrl', 'alt', 'c'] },
  { id: 4, cmd: i18n`settings.keymap.exitModal`, mac: ['esc'], win: ['esc'] },
  { id: 5, cmd: i18n`settings.keymap.commandPalette`, mac: ['cmd', 'shift', 'p'], win: ['ctrl', 'shift', 'p'] },
  { id: 6, cmd: i18n`settings.keymap.filePalette`, mac: ['cmd', 'p'], win: ['ctrl', 'p'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', '1'], win: ['ctrl', 'alt', '1'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', 'shift', '1'], win: ['ctrl', 'alt', 'shift', '1'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', '2'], win: ['ctrl', 'alt', '2'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', 'shift', '2'], win: ['ctrl', 'alt', 'shift', '2'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', '3'], win: ['ctrl', 'alt', '3'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', 'shift', '3'], win: ['ctrl', 'alt', 'shift', '3'] },
  // { cmd: i18n`tab.contextMenu.horizontalSplit`, mac: ['cmd', 'alt', '4'], win: ['ctrl', 'alt', '4'] },
  { id: 7, cmd: i18n`settings.keymap.showSettings`, mac: ['cmd', ','], win: ['ctrl', ','] },
  { id: 8, cmd: i18n`file.goto`, mac: ['ctrl', 'g'], win: ['ctrl', 'g'] },
  { id: 9, cmd: i18n`settings.keymap.toggleFormat`, mac: ['alt', 'l'], win: ['alt', 'l'] },
  { id: 10, cmd: i18n`settings.keymap.toggleComment`, mac: ['cmd', '/'], win: ['ctrl', '/'] },
  { id: 11, cmd: i18n`settings.keymap.into_zenmode`, mac: ['cmd', 'f11'], win: ['ctrl', 'f11'] },
  { id: 12, cmd: i18n`settings.keymap.exit_zenmode`, mac: ['esc'], win: ['esc'] },
]

export default observer(({ content }) => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.keymap.main`}</h2>
    <div>
      {content.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
        />
      )}
      <p>{i18n`settings.keymap.sysKeymap`}</p>
      <table className="keymap-list">
        <thead>
          <tr>
            <th>{i18n`settings.keymap.command`}</th>
            <th>Mac {i18n`settings.keymap.keymap`}</th>
            <th>Win {i18n`settings.keymap.keymap`}</th>
          </tr>
        </thead>
        <tbody>
          {keymapStore.systemKeymaps.map((keymap, index) => <Row key={`${keymap.command}-${index}`} {...keymap} />)}
        </tbody>
      </table>
      <p>{i18n`settings.keymap.pluginKeymap`}</p>
      <table className="keymap-list">
        <thead>
          <tr>
            <th>{i18n`settings.keymap.command`}</th>
            <th>Mac {i18n`settings.keymap.keymap`}</th>
            <th>Win {i18n`settings.keymap.keymap`}</th>
            <th>{i18n`settings.keymap.pluginSource`}</th>
          </tr>
        </thead>
        {keymapStore.pluginsKeymaps.map(keyConfig => (
          <tbody key={keyConfig.name}>
            <thead>{keyConfig.contribution}</thead>
            {
              keyConfig.keymaps.map((keymap, index) => <Row key={`${keymap.command}-${index}`} {...keymap} source={keyConfig.name} />)
            }
          </tbody>
        ))}
      </table>
    </div>
  </div>
))

const Row = ({ label, mac, win, source }) => {
  const macKeyS = mac.split('+')
  const winKeys = win.split('+')
  return (
    <tr>
      <td>{label}</td>
      <td>{macKeyS.map(key => <span className="key" key={key}>{key}</span>)}</td>
      <td>{winKeys.map(key => <span className="key" key={key}>{key}</span>)}</td>
      {source && <td>{source}</td>}
    </tr>
  );
}
