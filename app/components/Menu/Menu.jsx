import React, { Component } from 'react'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import MenuSheet from './MenuSheet'
import noop from 'lodash/noop'
import EventEmitter from 'eventemitter3'
import MenuContextTypes from './MenuContextTypes'

const keyCodes = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  esc: 27,
  tab: 9,
  enter: 13,
}

class MenuContainer extends Component {
  constructor (props) {
    super(props)
    this.state = { value: '' }
    this.emitter = new EventEmitter()
    this.reset = debounce(
      () => this.setState({ value: '' })
    , 500, { trailing: true })
  }

  getChildContext () {
    const self = this
    return {
      subscribe (event, handler) {
        self.emitter.on(event, handler)
        return () => self.emitter.removeListener(event, handler)
      },
      setFocus (menuKey) {
        self.setState({ currentFocus: menuKey })
      },
      getFocus () {
        return self.state.currentFocus
      },
      menuContext: this.props.context,
      deactivateTopLevelMenu: this.props.deactivate,
      activatePrevTopLevelMenuItem: this.props.activatePrevTopLevelMenuItem,
      activateNextTopLevelMenuItem: this.props.activateNextTopLevelMenuItem,
    }
  }

  componentWillMount () {
    this.deactivateTopLevelMenu = (e) => {
      this.props.deactivate()
    }
    if (this.deactivateTopLevelMenu) this.deactivateTimeout = setTimeout(() => window.addEventListener('click', this.deactivateTopLevelMenu), 1000)
  }

  componentDidMount () {
    // we use tabindex to render the container a focus trap
    // so that keyboard events can be listened in this scope
    this.containerDOM.focus()
  }

  componentWillUnmount () {
    if (this.deactivateTopLevelMenu) {
      clearTimeout(this.deactivateTimeout)
      window.removeEventListener('click', this.deactivateTopLevelMenu)
    }
  }

  onKeyPress = (e) => {
    const char = String.fromCharCode(e.charCode)
    const value = this.state.value + char
    this.setState({ value })
    this.reset()
    this.emitter.emit('keyEvent', { type: 'INPUT', value, target: this.state.currentFocus })
  }

  onKeyDown = (e) => {
    const sendKeyEvent = eventType =>
      this.emitter.emit('keyEvent', { type: eventType, target: this.state.currentFocus })
    switch (e.keyCode) {
      case keyCodes.up:
        return sendKeyEvent('UP')
      case keyCodes.down:
        return sendKeyEvent('DOWN')
      case keyCodes.left:
        return sendKeyEvent('LEFT')
      case keyCodes.right:
        return sendKeyEvent('RIGHT')
      case keyCodes.enter:
        return sendKeyEvent('ENTER')

      case keyCodes.esc:
        this.props.deactivate()
        return sendKeyEvent('ESC')

      case keyCodes.tab:
        e.preventDefault()
        if (e.shiftKey) {
          this.props.activatePrevTopLevelMenuItem()
          return sendKeyEvent('SHIFT_TAB')
        } else {
          this.props.activateNextTopLevelMenuItem()
          return sendKeyEvent('TAB')
        }
      default:
        break
    }
    e.stopPropagation()
  }


  onFilterInputChange = (filterValue) => {
    const targetItemName = this.itemNames2Index
      .find(itemName => itemName.startsWith(filterValue.toLowerCase()))
    const targetIndex = this.itemNames2Index.indexOf(targetItemName)
    this.activateItemAtIndex(targetIndex)
  }

  render () {
    const { items, className, style, deactivate } = this.props
    return (
      <div tabIndex='1'
        ref={r => this.containerDOM = r}
        onClick={e => e.stopPropagation()}
        onKeyDown={this.onKeyDown}
        onKeyPress={this.onKeyPress}
      >
        <MenuSheet items={items}
          className={className}
          style={style}
          deactivate={deactivate}
        />
      </div>
    )
  }
}

MenuContainer.propTypes = {
  items: PropTypes.array.isRequired,
  deactivate: PropTypes.func.isRequired,
  activateNextTopLevelMenuItem: PropTypes.func.isRequired,
  activatePrevTopLevelMenuItem: PropTypes.func.isRequired,
  context: PropTypes.any.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
}

MenuContainer.defaultProps = {
  className: '',
  style: {},
  context: {},
  activateNextTopLevelMenuItem: noop,
  activatePrevTopLevelMenuItem: noop,
}

MenuContainer.childContextTypes = MenuContextTypes

export default MenuContainer
