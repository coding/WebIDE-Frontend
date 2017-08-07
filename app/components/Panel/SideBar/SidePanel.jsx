import React, { Component, PropTypes } from 'react'
import _ from 'lodash'
import { sideBar } from 'components/Plugins/constants'
import { pluginRegister } from '../../Plugins/actions'
import PluginArea from '../../Plugins/component'

class SidePanelContainer extends Component {
  componentWillMount () {
    const children = this.getChildren()
    const { side } = this.props

    const mapChildrenToRegister = children.map((child, idx) => ({
      label: child.props.label,
      position: sideBar[side],
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
    return (<div style={{ height: '100%' }}>
      <PluginArea
        position={sideBar[side]}
        getChildView={(plugin, view) => (
          <SidePanelViewContent key={plugin.viewId}
            view={view}
            isActive={plugin.status.get('active')}
          />
        )}
      />
    </div>)
  }
}
SidePanelContainer.propTypes = {
  children: PropTypes.node,
  side: PropTypes.string
}

const SidePanelViewContent = ({ isActive, view }) =>
  <div style={{ height: '100%', display: isActive ? 'block' : 'none' }}>
    {view}
  </div>

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
