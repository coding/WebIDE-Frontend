/* @flow weak */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import {dispatchCommand} from '../../commands';

const triangleIcon = (<div
  style={{
    marginLeft: 'auto',
    marginRight: '-10px',
    content: '',
    marginTop: '6',
    width: 0,
    height: 0,
    borderTop: '4px solid transparent',
    borderLeft: '8px solid #ccc',
    borderBottom: '4px solid transparent'
  }}
/>)

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItemIndex: -1
    };
  }

  componentWillMount() {
    this.deactivate = this.props.deactivate;
    if (this.deactivate)
      window.addEventListener('click', this.deactivate);
  }

  componentWillUnmount() {
    if (this.deactivate)
      window.removeEventListener('click', this.deactivate);
  }

  render() {
    const {items, className, style, deactivate, deactivateTopLevelMenu} = this.props;
    return (
      <ul className={cx('menu', className)}
        style={style}
        onClick={e => e.stopPropagation()}>
        { items.map( (item, i) =>
          <MenuItem item={item}
            index={i}
            isActive={this.state.activeItemIndex == i}
            toggleActive={this.activateItemAtIndex}
            deactivateTopLevelMenu={deactivate||deactivateTopLevelMenu}
            key={`menu-item-${item.name}-${i}`}
            state={this.props.state} /> )}
      </ul>
    );
  }

  activateItemAtIndex = (index) => {
    if (this.state.activeItemIndex == index) {
      this.setState({activeItemIndex:-1});
    } else {
      this.setState({activeItemIndex:index})
    }
  }
}


const handleMenuItemCommand = (item) => {
  if (typeof item.command === 'function') {
    item.command();
    return true;
  } else if (typeof item.command === 'string') {
    dispatchCommand(item.command);
    return true;
  }
}

const MenuItem = ({item, index, isActive, toggleActive, deactivateTopLevelMenu, state}) => {
  if (item.name == '-') return <li><hr /></li>;
  const disabled = item.checkDisable ? item.checkDisable(state) : item.isDisabled;
  return (
    <li className='menu-item'>
      <div
        className={cx('menu-item-container', {active: isActive, disabled: disabled, padding: '4px 8px' })}
        onMouseEnter={e => toggleActive(index)}
        onClick={e => {
          if(disabled)
            return;
          handleMenuItemCommand(item)&&deactivateTopLevelMenu()
        }} >
        <div className={item.icon} style={{ paddingTop: '3px', marginRight: '8px', marginLeft: '-6px' }}></div>
        <div className='menu-item-name'>{item.displayName || item.name}</div>
        { item.shortcut?
          <div className='menu-item-shortcut'>{item.shortcut}</div>
          : null }
        {
          item.items && item.items.length ?
          triangleIcon : null
        }
      </div>
      { isActive && item.items && item.items.length ?
        <Menu items={item.items} className={cx({active: isActive})}
          deactivateTopLevelMenu={deactivateTopLevelMenu} />
        : null}
    </li>
  );
}

export default Menu;
