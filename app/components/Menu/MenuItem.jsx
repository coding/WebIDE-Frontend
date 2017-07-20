import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import MenuSheet from './MenuSheet'
import MenuContextTypes from './MenuContextTypes'
import { isFunction, isBoolean } from 'utils/is'

const handleMenuItemCommand = (command, menuContext) => {
  if (typeof command === 'function') {
    command(menuContext)
    return true
  } else {
    // ↓ temporary measure to resolve a cyclic dependent conflict
    require('../../commands').dispatchCommand(command)
    return true
  }
}

class MenuItem extends Component {
  constructor (props) {
    super()
    this.state = {
      submenuActiveItemIndex: -1
    }
    this.submenuShowTimeout = null
    const { item, state } = props
  }

  componentWillReceiveProps (nextProps) {
    // if has no submenu, noop
    if (!this.props.item.items) return

    // isActive transits from true to false
    if (this.props.isActive && !nextProps.isActive) {
      clearTimeout(this.submenuShowTimeout)
      if (this.state.isSubmenuShown) this.setState({ isSubmenuShown: false })
    }
  }

  componentWillUnmount () {
    clearTimeout(this.submenuShowTimeout)
  }

  onMouseEnter = () => {
    this.props.toggleActive(this.props.index)
    this.submenuShowTimeout = setTimeout(
      () => {
        this.setState({ isSubmenuShown: true })
        this.context.setFocus(this.props.parentMenu)
      }
    , 200)
  }

  onSubmenuMount = (ref) => {
    this.submenu = ref
  }

  showSubmenu = () => {
    this.setState({ isSubmenuShown: true, submenuActiveItemIndex: 0 })
  }

  execCommand = () => {
    const { item } = this.props
    const command = item.command

    if (item.isDisabled) return null // no-op

    if (item.items) return this.showSubmenu()

    let execCommandSuccess = false
    if (typeof command === 'function') {
      command(this.context.menuContext)
      execCommandSuccess = true
    } else {
      // @fixme: ↓ temporary measure to resolve a cyclic dependent conflict
      require('../../commands').dispatchCommand(command)
      execCommandSuccess = true
    }

    if (execCommandSuccess) this.context.deactivateTopLevelMenu()
  }


  render () {
    const { item, isActive } = this.props
    const itemElement = item.element ? React.createElement(item.element, { item }) : null

    // when submenu is focused, onMouseLeave from parent <MenuSheet> won't trigger lost of <MenuItem> activity (which normally will)
    const submenuIsFocused = this.submenu && this.context.getFocus() === this.submenu
    const isDisabled = isBoolean(item.isDisabled) ? item.isDisabled
      : isFunction(item.getIsDisabled) && item.getIsDisabled(this.context.menuContext)
    return (
      <li className='menu-item'>
        <div
          className={cx('menu-item-container', {
            active: isActive || submenuIsFocused,
            disabled: isDisabled,
          })}
          onMouseEnter={this.onMouseEnter}
          onClick={this.execCommand}
        >
          {(item.icon || item.iconElement) && (
            <div className={cx('menu-item-icon', item.icon)}>
              {item.iconElement}
            </div>
          )}
          <div className='menu-item-name'>{itemElement || item.displayName || item.name}</div>
          { item.shortcut
            ? <div className='menu-item-shortcut'>{item.shortcut}</div>
          : null }
          {item.items && <div className='menu-item-triangle'>▶</div>}
        </div>
        {item.items && ((isActive && this.state.isSubmenuShown) || submenuIsFocused) &&
          <MenuSheet isSubmenu
            ref={this.onSubmenuMount}
            items={item.items}
            deactivate={() => {
              this.context.setFocus(this.props.parentMenu)
              this.setState({ isSubmenuShown: false })
            }}
            activeItemIndex={this.state.submenuActiveItemIndex}
          />
        }
      </li>
    )
  }
}

MenuItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  toggleActive: PropTypes.func.isRequired,
  parentMenu: PropTypes.any.isRequired,
}

MenuItem.contextTypes = MenuContextTypes

export default MenuItem
