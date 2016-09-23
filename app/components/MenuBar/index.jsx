/* @flow weak */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Menu from '../Menu';
import menuBarItems from './menuBarItems';

class MenuBar extends Component {
  static defaultProps = {
    items: menuBarItems
  }

  constructor(props) {
    super(props);
    this.state = {
      activeItemIndex: -1
    };
  }

  render() {
    const {items} = this.props;
    return (
      <ul className='menu-bar'>
        { items.map( (menuBarItem, i) =>
          <MenuBarItem item={menuBarItem}
            isActive={this.state.activeItemIndex == i}
            shouldHoverToggleActive={this.state.activeItemIndex > -1}
            toggleActive={this.activateItemAtIndex}
            key={`menu-bar-${menuBarItem.name}`}
            index={i}
          />) }
      </ul>
    );
  }

  activateItemAtIndex = (index, isTogglingEnabled) => {
    if (isTogglingEnabled && this.state.activeItemIndex == index) {
      this.setState({activeItemIndex:-1});
    } else {
      this.setState({activeItemIndex:index})
    }
  }
}


const MenuBarItem = (props) => {
  const { item, isActive, shouldHoverToggleActive,
          toggleActive, index} = props;
  const menuBarItem = item;
  return (
    <li className={cx('menu-bar-item', menuBarItem.className)}>
      <div className={cx('menu-bar-item-container',
          {active: isActive}
        )}
        onClick={ e => {e.stopPropagation();toggleActive(index, true);} }
        onMouseEnter={ e => {if (shouldHoverToggleActive) toggleActive(index)} }
      >
        {menuBarItem.name}
      </div>
      { isActive?
        <Menu items={menuBarItem.items} className={cx('top-down to-right', {active: isActive})}
          deactivate={toggleActive.bind(null,-1)}/>
        : null}
    </li>
  );
}


export default MenuBar;
