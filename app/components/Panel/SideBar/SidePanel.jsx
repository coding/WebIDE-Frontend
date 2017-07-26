import React, { Component, PropTypes } from 'react'
import { inject } from 'mobx-react'
import _ from 'lodash'

import {
  registerSideBarView
} from './actions'
import state, { labelsShape } from './state'


@inject((__, { side }) => {
  const labels = state.labels.values().filter(label => label.side === side)
  const activeViewId = state.activeStatus.get(side)
  return { activeViewId, labels, side }
})
class SidePanelContainer extends Component {
  componentWillMount () {
    const children = this.getChildren()
    const { side } = this.props
    const mapChildrenToSidebar = children.map((child, idx) => ({
      side,
      key: child.key || `${side}_${idx}`,
      isActive: child.props.active || false,
      label: child.props.label,
      view: child
    }))
    registerSideBarView(mapChildrenToSidebar)
  }
  getChildren () {
    if (!this.props.children) return []
    return Array.isArray(this.props.children) ? this.props.children : [this.props.children]
  }
  render () {
    const { labels = {}, activeViewId } = this.props
    return (<div style={{ height: '100%' }}>
      {labels
      .sort((a, b) => a.weight || 1 - b.weight || 1)
      .map(label =>
        <SidePanelViewContent key={label.viewId}
          view={state.views[label.viewId]}
          isActive={activeViewId === label.viewId}
        />
      )}
    </div>)
  }
}
SidePanelContainer.propTypes = {
  labels: labelsShape,
  children: PropTypes.node,
  activeViewId: PropTypes.string,
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
