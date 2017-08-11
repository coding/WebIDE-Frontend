import React, { Component } from 'react'
import EditorTabState from 'components/Tab/state'
import { observer } from 'mobx-react'
import cx from 'classnames'
import modeInfos from 'components/Editor/components/CodeEditor/addons/mode/modeInfos'
import Menu from '../../Menu'

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
    const activeTab = EditorTabState.activeTab
    activeTab.editor.setMode(name)
  }

  makeModeMenuItems () {
    return modeInfos.map((mode) => ({
      key: mode.name,
      name: mode.name,
      command: () => {
        this.setMode(mode.name)
      },
    }))
  }

  render () {
    const activeTab = EditorTabState.activeTab
    if (!activeTab) {
      return null
    }
    return (
      <div className='status-bar-menu-item'
        onClick={e => { this.toggleActive(true, true) }}
      >
        {activeTab && <span>
          {activeTab.editor.mode}
        </span>}
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
