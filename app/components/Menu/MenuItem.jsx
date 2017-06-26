import React from 'react'
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

function MenuItem (props) {
  const { item, index, isActive, toggleActive, deactivateTopLevelMenu, state, context } = props
  if (item.visible && !item.visible(context)) return null
  const itemElement = item.element ? React.createElement(item.element, { item }) : null
  if (item.name == '-') return <li><hr /></li>
  const disabled = item.checkDisable ? item.checkDisable(state) : item.isDisabled
  return (
    <li className='menu-item'>
      <div
        className={cx('menu-item-container', {
          active: isActive,
          disabled,
        })}
        onMouseEnter={() => toggleActive(index)}
        onClick={() => {
          !disabled && handleMenuItemCommand(item.command, context) && deactivateTopLevelMenu()
        }}
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
        { item.items && item.items.length ? <div className='menu-item-triangle'>▶</div> : null }
      </div>
      { isActive && item.items && item.items.length ?
        <Menu items={item.items} className='deferred-active'
          deactivateTopLevelMenu={deactivateTopLevelMenu}
        />
      : null }
    </li>
  )
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
