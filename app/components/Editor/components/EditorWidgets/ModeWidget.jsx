import React, { Component } from 'react'
import { observer } from 'mobx-react'
import * as monaco from 'monaco-editor'
import config from 'config'
import cx from 'classnames'
import modeInfos from 'components/Editor/components/CodeEditor/addons/mode/modeInfos'
import monacoModeInfos from 'components/MonacoEditor/utils/modeInfos'
import Menu from 'components/Menu'

@observer
export default class ModeWidget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isActive: false
    }
  }

  toggleActive (isActive, isTogglingEnabled) {
    if (isTogglingEnabled) { isActive = !this.state.isActive }
    this.setState({ isActive })
  }

  setMode (name) {
    this.props.editor.setMode(name)
  }

  makeModeMenuItems () {
    let languageInfos = modeInfos
    if (!config.switchOldEditor) {
      languageInfos = monacoModeInfos
    }
    return languageInfos.map((mode) => ({
      key: mode.name || mode.id,
      name: mode.name || mode.aliases[0],
      command: () => {
        this.setMode(mode.name || mode.id)
      },
    }))
  }

  render () {
    const editor = this.props.editor
    return (
      <div className='editor-widget'
        onClick={e => { this.toggleActive(true, true) }}
      >
        <span>{editor.mode}</span>
        {this.state.isActive ?
          <div className='mode-widget'>
            <Menu className={cx('bottom-up to-left', { active: this.state.isActive })}
              style={{
                position: 'relative',
                border: 0,
              }}
              items={this.makeModeMenuItems()}
              deactivate={this.toggleActive.bind(this, false)}
            />
          </div>
        : null}
      </div>
    )
  }
}
