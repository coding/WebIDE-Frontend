import React, { Component } from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'
import MenuContainer from './MenuContainer'
import MenuItem from './MenuItem'
import noop from 'lodash/noop'


function getNearestSelectableItemIndex (items, index, direction='next') {
  const item = items[index]
  if (!item) return -1
  if (item.isDisabled || item.name === '-') {
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
  return items.map(item => item.name.toLowerCase())
}

class Menu extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeItemIndex: getNearestSelectableItemIndex(props.items, props.defaultActiveItemIndex)
    }
    this.itemNames2Index = buildFilterIndex(this.props.items)
    this.menuItemInstances = []
  }

  componentWillMount () {
    this.deactivateTopLevelMenu = () => { this.props.deactivateTopLevelMenu() }
    if (this.deactivateTopLevelMenu) window.addEventListener('click', this.deactivateTopLevelMenu)
  }

  componentWillUnmount () {
    if (this.deactivateTopLevelMenu) window.removeEventListener('click', this.deactivateTopLevelMenu)
  }

  onFilterInputChange = (filterValue) => {
    const targetItemName = this.itemNames2Index.find(itemName => itemName.startsWith(filterValue.toLowerCase()))
    const targetIndex = this.itemNames2Index.indexOf(targetItemName)
    if (targetIndex !== -1) this.activateItemAtIndex(targetIndex)
  }

  onKeyEvent = (customEvent) => {
    const currentIndex = this.state.activeItemIndex
    const itemsLength = this.props.items.length
    const activeItem = this.props.items[currentIndex]
    const activeMenuItemInstance = this.menuItemInstances[currentIndex]
    let nextIndex = -1
    switch (customEvent.type) {
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
        console.log('issub?', this.props.isSubmenu)
        if (this.props.isSubmenu) {
          this.props.deactivate()
        } else {
          this.props.activatePrevTopLevelMenuItem()
        }
        break
      case 'SHIFT_TAB':
        this.props.activatePrevTopLevelMenuItem()
        break

      case 'RIGHT':
        if (activeItem && activeItem.items) {
          if (activeMenuItemInstance) activeMenuItemInstance.showSubmenu()
        } else {
          this.props.activateNextTopLevelMenuItem()
        }
        break
      case 'TAB':
        this.props.activateNextTopLevelMenuItem()
        break

      case 'ESC':
        this.props.deactivateTopLevelMenu()
        break

      case 'ENTER':
        if (activeMenuItemInstance) activeMenuItemInstance.execCommand()
        break

      case 'INPUT':
        this.onFilterInputChange(customEvent.value)
        break

      default:
    }
    if (nextIndex !== -1) this.activateItemAtIndex(nextIndex)
  }

  activateItemAtIndex = (index) => {
    this.setState({ activeItemIndex: index })
  }

  render () {
    const { items, className, style, deactivateTopLevelMenu, onMouseEnter } = this.props
    return (
      <MenuContainer
        className={cx('menu', className)}
        style={style}
        onMouseEnter={onMouseEnter || (e => e) }
        onMouseLeave={() => this.setState({ activeItemIndex: -2 })}
        onKeyEvent={this.onKeyEvent}
      >
        {items.map((item, i) =>
          <MenuItem item={item}
            index={i}
            ref={r => this.menuItemInstances[i] = r}
            isActive={this.state.activeItemIndex === i}
            currentActiveItemIndex={this.state.activeItemIndex}
            toggleActive={this.activateItemAtIndex}
            deactivateTopLevelMenu={deactivateTopLevelMenu}
            key={`menu-item-${item.name}-${i}`}
            state={this.props.state}
            context={this.props.context}
          />
        )}
      </MenuContainer>
    )
  }
}

Menu.propTypes = {
  deactivateTopLevelMenu: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
}

Menu.defaultProps = {
  defaultActiveItemIndex: -1,
  activateNextTopLevelMenuItem: noop,
  activatePrevTopLevelMenuItem: noop,
}

export default Menu
