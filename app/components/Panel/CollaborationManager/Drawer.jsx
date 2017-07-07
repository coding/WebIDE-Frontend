import React, { Component } from 'react'
import cx from 'classnames'
import ResizeBar from 'components/ResizeBar2'

class Drawer extends Component {
  constructor (props) {
    super(props)
    this.state = { showDrawer: true }
  }

  toggleDrawer = (e) => {
    this.setState({ showDrawer: !this.state.showDrawer })
  }

  render () {
    const style = {
      flexGrow: this.props.size,
    }
    return (
      <div className='drawer' id={this.props.id} style={style}>
        <div className='drawer-topbar'>
          <div className='drawer-header' onClick={this.toggleDrawer}>
            <i className={cx('indicator fa', {
              'fa-angle-down': this.state.showDrawer,
              'fa-angle-right': !this.state.showDrawer,
            })} />{this.props.header}
          </div>
        </div>

        {this.state.showDrawer && this.props.children}
      </div>
    )
  }
}

class DrawersContainer extends Component {
  render () {
    const drawerCount = this.props.children.length
    const style = {
      flexDirection: this.props.flexDirection,
    }
    return <div className='drawers-container' style={style} >
      {this.props.children.reduce((acc, drawerComponent, index) => {
        acc.push(drawerComponent)
        if (index < drawerCount - 1) {
          acc.push(<ResizeBar parentFlexDirection='column' />)
        }
        return acc
      }, [])}
    </div>
  }
}

export { Drawer, DrawersContainer }
