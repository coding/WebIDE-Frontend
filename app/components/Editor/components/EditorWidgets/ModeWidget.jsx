import React, { Component } from 'react'
import { observer } from 'mobx-react'
 
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
    const languageInfos = monaco.languages.getLanguages()
    return languageInfos.map((mode) => ({
      key: mode.id,
      name: mode.aliases[0] || mode.id,
      command: () => {
        this.setMode(mode.id)
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
