import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'

class MenuContainer extends Component {
  static defaultProps = {
    onChange: x => x
  }

  constructor () {
    super()
    this.state = { value: '' }
    this.reset = debounce(
      () => this.setState({ value: '' })
    , 500, { trailing: true })
  }

  onKeyDown = (e) => {
    console.log(e.target, this.containerDOM)
    const sendKeyCommand = (eventType) => this.props.onKeyEvent({ type: eventType })
    const keyCodes = {
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      esc: 27,
      tab: 9,
      enter: 13,
    }
    switch (e.keyCode) {
      case keyCodes.up:
        return sendKeyCommand('UP')
      case keyCodes.down:
        return sendKeyCommand('DOWN')
      case keyCodes.left:
        return sendKeyCommand('LEFT')
      case keyCodes.right:
        return sendKeyCommand('RIGHT')
      case keyCodes.esc:
        return sendKeyCommand('ESC')
      case keyCodes.enter:
        return sendKeyCommand('ENTER')
      case keyCodes.tab:
        e.preventDefault()
        if (e.shiftKey) {
          return sendKeyCommand('SHIFT_TAB')
        } else {
          return sendKeyCommand('TAB')
        }
    }
    e.stopPropagation()
  }

  onKeyPress = (e) => {
    const char = String.fromCharCode(e.charCode)
    const value = this.state.value + char
    this.setState({ value })
    this.reset()
    this.props.onKeyEvent({ type: 'INPUT', value })
  }

  componentDidMount () {
    this.containerDOM.focus()
    this.containerDOM.addEventListener('blur', function (e) {
      console.log('i am blurred', this)
    })
  }

  focus () {
    this.containerDOM.focus()
  }

  render () {
    const { className, style, onMouseEnter, onMouseLeave } = this.props
    return (
      <ul tabIndex='1'
        ref={r => this.containerDOM = r}
        className={className}
        style={style}
        onClick={e => e.stopPropagation()}
        onMouseEnter={onMouseEnter || (e => e) }
        onMouseLeave={onMouseLeave}
        onKeyDown={this.onKeyDown}
        onKeyPress={this.onKeyPress}
      >
        {this.props.children}
      </ul>
    )
  }
}

MenuContainer.propTypes = {
  onKeyEvent: PropTypes.func.isRequired
}

export default MenuContainer
