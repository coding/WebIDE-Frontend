/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import Menu from './Menu'

const triangleIcon = (<div
  style={{
    marginLeft: 'auto',
    marginRight: '-10px',
    content: '',
    marginTop: '6px',
    width: 0,
    height: 0,
    borderTop: '4px solid transparent',
    borderLeft: '8px solid #ccc',
    borderBottom: '4px solid transparent'
  }}
/>)


const handleMenuItemCommand = (command) => {
  if (typeof command === 'function') {
    command()
    return true
  } else {
    // ↓ temporary measure to resolve a cyclic dependent conflict
    require('../../commands').dispatchCommand(command)
    return true
  }
}

const MenuItem = ({item, index, isActive, toggleActive, deactivateTopLevelMenu, state, context}) => {
  if (item.visible && !item.visible(context)) return null
  let itemElement = item.element ? React.createElement(item.element, { item }) : null
  if (item.name == '-') return <li><hr /></li>
  const disabled = item.checkDisable ? item.checkDisable(state) : item.isDisabled
  return (
    <li className='menu-item'>
      <div
        className={cx('menu-item-container', {
          active: isActive,
          disabled: disabled,
          padding: '4px 10px'
        })}
        onMouseEnter={e => toggleActive(index)}
        onClick={e => {
          if (disabled) return
          handleMenuItemCommand(item.command)&&deactivateTopLevelMenu()
        }}
      >
        <div className={item.icon}>{item.iconElement || <div style={{ marginLeft :'15px' }} />}</div>
        <div className='menu-item-name'>{itemElement || item.displayName || item.name}</div>
        { item.shortcut
          ? <div className='menu-item-shortcut'>{item.shortcut}</div>
        : null }
        { item.items && item.items.length
          ? triangleIcon
        : null }
      </div>
      { isActive && item.items && item.items.length ?
        <Menu items={item.items} className={cx({active: isActive})}
          deactivateTopLevelMenu={deactivateTopLevelMenu} />
      : null }
    </li>
  )
}

export default MenuItem
