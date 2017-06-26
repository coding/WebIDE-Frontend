import React, { Component } from 'react'
import cx from 'classnames'
import MenuItem from './MenuItem'

class Menu extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeItemIndex: -1
    }
  }

  componentWillMount () {
    this.deactivate = this.props.deactivate
    if (this.deactivate) window.addEventListener('click', this.deactivate)
  }

  componentWillUnmount () {
    if (this.deactivate) window.removeEventListener('click', this.deactivate)
  }

  render () {
    const { items, className, context, style, deactivate, deactivateTopLevelMenu } = this.props
    return (
      <ul className={cx('menu', className)}
        style={style}
        onClick={e => e.stopPropagation()}
      >
        {items.map((item, i) =>
          <MenuItem item={item}
            index={i}
            isActive={this.state.activeItemIndex === i}
            toggleActive={this.activateItemAtIndex}
            deactivateTopLevelMenu={deactivate || deactivateTopLevelMenu}
            key={`menu-item-${item.name}-${i}`}
            state={this.props.state}
            context={this.props.context}
          />
        )}
      </ul>
    )
  }

  activateItemAtIndex = (index) => {
    if (this.state.activeItemIndex === index) {
      this.setState({ activeItemIndex: -1 })
    } else {
      this.setState({ activeItemIndex: index })
    }
  }
}

export default Menu
