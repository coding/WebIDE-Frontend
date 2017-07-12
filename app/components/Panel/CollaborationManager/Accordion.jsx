import React, { Component } from 'react'
import cx from 'classnames'
import ResizeBar from 'components/ResizeBar2'

class Accordion extends Component {
  constructor (props) {
    super(props)
    this.state = { showSection: true }
  }

  toggleShow = (e) => {
    this.setState({ showSection: !this.state.showSection })
  }

  render () {
    const style = {
      flexGrow: this.props.size,
    }
    return (
      <div className='accordion' id={this.props.id} style={style}>
        <div className='accordion-topbar'>
          <div className='accordion-header' onClick={this.toggleShow}>
            <i className={cx('indicator fa', {
              'fa-angle-down': this.state.showSection,
              'fa-angle-right': !this.state.showSection,
            })} />{this.props.header}
          </div>
        </div>

        {this.state.showSection && this.props.children}
      </div>
    )
  }
}

class AccordionGroup extends Component {
  render () {
    const sectionCount = this.props.children.length
    const style = {
      flexDirection: this.props.flexDirection,
    }
    return <div className='accordion-group' style={style} >
      {this.props.children.reduce((acc, component, index) => {
        acc.push(component)
        if (index < sectionCount - 1) {
          acc.push(<ResizeBar parentFlexDirection='column' />)
        }
        return acc
      }, [])}
    </div>
  }
}

export { Accordion, AccordionGroup }
