import React, { Component, PropTypes } from 'react'
import _ from 'lodash'
import { SIDEBAR } from 'components/Plugins/constants'
import { pluginRegister } from '../../Plugins/actions'
import PluginArea from '../../Plugins/component'

class SidePanelContainer extends Component {
  componentWillMount () {
    const children = this.getChildren()
    const { side } = this.props

    const mapChildrenToRegister = children.map((child, idx) => ({
      label: child.props.label,
      position: SIDEBAR[side.toUpperCase()],
      key: child.key || idx,
      view: child,
      active: child.props.active
    }))
    pluginRegister(mapChildrenToRegister, (label, child) => {
      label.status.set('active', child.active)
    })
  }
  getChildren () {
    if (!this.props.children) return []
    return Array.isArray(this.props.children) ? this.props.children : [this.props.children]
  }
  render () {
    const { side } = this.props
    return (
      <PluginArea
        style={{ height: '100%' }}
        position={SIDEBAR[side.toUpperCase()]}
        getChildView={(plugin, view) => (
          <SidePanelViewContent key={plugin.viewId}
            view={view}
            isActive={plugin.status.get('active')}
          />
        )}
      />
    )
  }
}
SidePanelContainer.propTypes = {
  children: PropTypes.node,
  side: PropTypes.string
}

class SidePanelViewContent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isActived: false
    }
  }

  componentWillReceiveProps ({ isActive }) {
    if (isActive && !this.state.isActived) {
      this.setState({
        isActived: true
      })
    }
  }

  render () {
    const { isActive, view } = this.props
    return (
      <div style={{ height: '100%', display: isActive ? 'block' : 'none' }}>
        {this.state.isActived && view}
      </div>
    )
  }
}
// const SidePanelViewContent = ({ isActive, view }) =>
  // <div style={{ height: '100%', display: isActive ? 'block' : 'none' }}>
    // {view}
  // </div>

SidePanelViewContent.propTypes = {
  isActive: PropTypes.bool,
  view: PropTypes.node
}

class SidePanelView extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return this.props.children
  }
}
SidePanelView.propTypes = {
  children: PropTypes.node
}


export { SidePanelContainer, SidePanelView }
