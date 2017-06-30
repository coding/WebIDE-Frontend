import React, { Component } from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import MenuItem from './MenuItem'
import MenuContextTypes from './MenuContextTypes'
import noop from 'lodash/noop'

function getNearestSelectableItemIndex (items, index, direction='next') {
  const item = items[index]
  if (!item) return -1
  if (item.isDisabled || item.isDivider) {
    if (direction === 'next') {
      return getNearestSelectableItemIndex(items, index + 1, direction)
    } else if (direction === 'prev') {
      return getNearestSelectableItemIndex(items, index - 1, direction)
    }
  } else {
    return index
  }
  return -1
}

function buildFilterIndex (items=[]) {
  return items.map(({ name='' }) => name.toLowerCase())
}

const MenuItemDivider = () => (<li><hr /></li>)

class Menu extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      activeItemIndex: getNearestSelectableItemIndex(props.items, props.activeItemIndex)
    }
    this.itemNames2Index = buildFilterIndex(this.props.items)
    this.menuItemInstances = []
  }

  componentWillMount () {
    this.context.setFocus(this) // <- auto setFocus on mount
    this.unsubscribe = this.context.subscribe('keyEvent', this.onKeyEvent)
  }

  componentWillUnmount () {
    if (this.unsubscribe) this.unsubscribe()
  }

  onFilterInputChange = (filterValue) => {
    const targetItemName = this.itemNames2Index
      .find(itemName => itemName.startsWith(filterValue.toLowerCase()))
    const targetIndex = this.itemNames2Index.indexOf(targetItemName)
    this.activateItemAtIndex(targetIndex)
  }

  onKeyEvent = (keyEvent) => {
    // do not response if self is not the target
    if (keyEvent.target !== this) return undefined
    const currentIndex = this.state.activeItemIndex
    const itemsLength = this.props.items.length
    const activeItem = this.props.items[currentIndex]
    const activeMenuItemInstance = this.menuItemInstances[currentIndex]
    let nextIndex = -1
    switch (keyEvent.type) {
      case 'UP':
        if (currentIndex < 0) {
          nextIndex = itemsLength - 1
        } else {
          nextIndex = currentIndex - 1
        }
        if (nextIndex < 0) nextIndex = 0
        nextIndex = getNearestSelectableItemIndex(this.props.items, nextIndex, 'prev')
        break

      case 'DOWN':
        if (currentIndex < 0) {
          nextIndex = 0
        } else {
          nextIndex = currentIndex + 1
        }
        if (nextIndex >= itemsLength) nextIndex = itemsLength - 1
        nextIndex = getNearestSelectableItemIndex(this.props.items, nextIndex, 'next')
        break

      case 'LEFT':
        if (this.props.isSubmenu) {
          this.props.deactivate()
        } else {
          this.context.activatePrevTopLevelMenuItem()
        }
        break

      case 'RIGHT':
        if (activeItem && activeItem.items) {
          if (activeMenuItemInstance) activeMenuItemInstance.showSubmenu()
        } else {
          this.context.activateNextTopLevelMenuItem()
        }
        break

      case 'ENTER':
        if (activeMenuItemInstance) activeMenuItemInstance.execCommand()
        break

      case 'INPUT':
        this.onFilterInputChange(keyEvent.value)
        break

      default:
    }
    this.activateItemAtIndex(nextIndex)
  }

  activateItemAtIndex = (index) => {
    if (index >= 0) this.setState({ activeItemIndex: index })
  }

  renderMenuItems (items) {
    return items.map((item, i) => {
      const key = `menu-item-${item.name}-${i}`

      if (item.isDivider) {
        return <MenuItemDivider key={key} />
      }

      return (
        <MenuItem item={item}
          index={i}
          key={key}
          ref={r => this.menuItemInstances[i] = r}
          isActive={this.state.activeItemIndex === i}
          currentActiveItemIndex={this.state.activeItemIndex}
          toggleActive={this.activateItemAtIndex}
          parentMenu={this}
          context={this.props.context}
        />
      )
    })
  }

  render () {
    const { items, className, style } = this.props

    return (
      <ul className={cx('menu', className)}
        style={style}
        onClick={e => e.stopPropagation()}
        onMouseEnter={() => this.context.setFocus(this) }
        onMouseLeave={() => this.context.getFocus() === this && this.setState({ activeItemIndex: -2 })}
      >
        {this.renderMenuItems(items)}
      </ul>
    )
  }
}

Menu.propTypes = {
  isSubmenu: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  deactivate: PropTypes.func.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  activeItemIndex: PropTypes.number,
}

Menu.defaultProps = {
  isSubmenu: false,
  activeItemIndex: -1,
}

Menu.contextTypes = MenuContextTypes

export default Menu
