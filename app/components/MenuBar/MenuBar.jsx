import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import Menu from '../Menu'
import menuBarItems from './menuBarItems'
import api from 'backendAPI'
import config from '../../config'

class MenuBar extends Component {
  static propTypes = {
    items: PropTypes.oneOf(PropTypes.array, PropTypes.object)
  }

  constructor (props) {
    super(props)
    this.state = { activeItemIndex: -1 }
  }

  activateItemAtIndex = (index, isTogglingEnabled) => {
    if (isTogglingEnabled && this.state.activeItemIndex == index) {
      this.setState({ activeItemIndex: -1 })
    } else {
      this.setState({ activeItemIndex: index })
    }
  }

  handleSwitch = () => {
    api.switchVersion()
  }

  activatePrevMenuItem = () => {
    let nextIndex = this.state.activeItemIndex - 1
    if (nextIndex < 0) nextIndex = 0
    this.activateItemAtIndex(nextIndex)
  }

  activateNextMenuItem = () => {
    let nextIndex = this.state.activeItemIndex + 1
    if (nextIndex >= this.props.items.length) nextIndex = this.props.items.length - 1
    this.activateItemAtIndex(nextIndex)
  }

  render () {
    const { items } = this.props
    return (
      <div className='menu-bar-container'>
        <ul className='menu-bar'>
          { items.map((menuBarItem, i) =>
            <MenuBarItem item={menuBarItem}
              isActive={this.state.activeItemIndex == i}
              shouldHoverToggleActive={this.state.activeItemIndex > -1}
              toggleActive={this.activateItemAtIndex}
              key={`menu-bar-${menuBarItem.name}`}
              index={i}
              state={this.props}
              activatePrevTopLevelMenuItem={this.activatePrevMenuItem}
              activateNextTopLevelMenuItem={this.activateNextMenuItem}
            />) }
        </ul>
        {config.isPlatform && (<div className='btn btn-xs btn-info' onClick={this.handleSwitch}>
          Switch to v1
        </div>)}
      </div>
    )
  }
}

const MenuBarItem = (props) => {
  const { item, isActive, shouldHoverToggleActive,
          toggleActive, index, activatePrevTopLevelMenuItem, activateNextTopLevelMenuItem } = props
  const menuBarItem = item
  return (
    <li className={cx('menu-bar-item', menuBarItem.className)}>
      <div className={cx('menu-bar-item-container',
          { active: isActive }
        )}
        onClick={(e) => {
          e.stopPropagation()
          toggleActive(index, true)
          if (menuBarItem.onOpen) {
            if (!isActive) {
              menuBarItem.onOpen(item)
            }
          }
        }}
        onMouseEnter={(e) => { if (shouldHoverToggleActive) toggleActive(index) }}
      >
        {menuBarItem.name}
      </div>
      {isActive ?
        <Menu
          items={menuBarItem.items}
          className={cx('top-down to-right', { active: isActive })}
          deactivate={toggleActive.bind(null, -1)}
          activatePrevTopLevelMenuItem={activatePrevTopLevelMenuItem}
          activateNextTopLevelMenuItem={activateNextTopLevelMenuItem}
        />
      : null}
    </li>
  )
}

export default MenuBar
