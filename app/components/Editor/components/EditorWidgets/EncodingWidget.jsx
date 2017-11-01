import React, { Component } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import Menu from 'components/Menu'
import SUPPORTED_ENCODINGS from './encodings'

@observer
export default class EncodingWidget extends Component {
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

  setEncoding (encoding) {
    this.props.editor.setEncoding(encoding)
  }

  makeModeMenuItems () {
    return Object.entries(SUPPORTED_ENCODINGS).sort((a, b) => a[1].order - b[1].order).map(
      (entry) => {
        const [value, encoding] = entry
        return {
          key: value,
          name: encoding.labelLong,
          command: () => {
            this.setEncoding(value)
          }
        }
      }
    )
  }

  render () {
    const { editor = { file: {} } } = this.props || {}
    const encodingValue = editor.file.encoding || 'utf8'
    return (
      <div className='editor-widget'
        onClick={(e) => { this.toggleActive(true, true) }}
      >
        <span>{SUPPORTED_ENCODINGS[encodingValue].labelLong}</span>
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
