import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import Menu from './Menu'

const handleMenuItemCommand = (command, context) => {
  if (typeof command === 'function') {
    command(context)
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
      defaultActiveItemIndex: -1
    }
    this.submenuShowTimeout = null
    const { item, state } = props
    if (item.checkDisable) item.isDisabled = item.checkDisable(state)
  }

  componentWillReceiveProps (nextProps) {
    // if has no submenu, noop
    if (!this.props.item.items) return

    // isActive transits from true to false
    if (this.props.isActive && !nextProps.isActive) {
      clearTimeout(this.submenuShowTimeout)
      if (this.state.isSubmenuShown) this.setState({ isSubmenuShown: false })
    }

    if (nextProps.currentActiveItemIndex !== -2) {
      this.setState({ isSubmenuVisited: false })
    }
  }

  componentWillUnmount () {
    clearTimeout(this.submenuShowTimeout)
  }

  onMouseEnter = () => {
    this.props.toggleActive(this.props.index)
    this.submenuShowTimeout = setTimeout(
      () => this.setState({ isSubmenuShown: true })
    , 200)
  }

  onMouseEnterSubmenu = () => {
    this.setState({ isSubmenuVisited: true })
  }

  showSubmenu = () => {
    this.setState({ isSubmenuShown: true, defaultActiveItemIndex: 0 })
  }

  execCommand = () => {
    const { item, context } = this.props
    const command = item.command

    if (item.isDisabled) return null // no-op

    if (item.items) return this.showSubmenu()

    let execCommandSuccess = false
    if (typeof command === 'function') {
      command(context)
      execCommandSuccess = true
    } else {
      // @fixme: ↓ temporary measure to resolve a cyclic dependent conflict
      require('../../commands').dispatchCommand(command)
      execCommandSuccess = true
    }

    if (execCommandSuccess) this.props.deactivateTopLevelMenu()
  }

  render () {
    const { item, isActive, deactivateTopLevelMenu, state, context } = this.props
    if (item.visible && !item.visible(context)) return null

    // when hasSubmenu and submenu is visited, onMouseLeave from parent <Menu> won't trigger lost of <MenuItem> activity (which normally will)
    const shouldStayActive = item.items && this.state.isSubmenuVisited && (this.props.currentActiveItemIndex === -2)

    const itemElement = item.element ? React.createElement(item.element, { item }) : null
    if (item.name == '-') return <li><hr /></li>

    return (
      <li className='menu-item'>
        <div
          className={cx('menu-item-container', {
            active: isActive || shouldStayActive,
            disabled: item.isDisabled,
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
        {item.items && ((isActive && this.state.isSubmenuShown) || shouldStayActive) &&
          <Menu items={item.items}
            deactivate={() => this.setState({ isSubmenuShown: false })}
            deactivateTopLevelMenu={deactivateTopLevelMenu}
            onMouseEnter={this.onMouseEnterSubmenu}
            defaultActiveItemIndex={this.state.defaultActiveItemIndex}
            isSubmenu={true}
          />
        }
      </li>
    )
  }
}

MenuItem.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  toggleActive: PropTypes.func.isRequired,
  deactivateTopLevelMenu: PropTypes.func.isRequired,
  state: PropTypes.object,
  context: PropTypes.object,
}

export default MenuItem
