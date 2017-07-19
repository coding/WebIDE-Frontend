import React, { Component, PropTypes } from 'react'
import { inject } from 'mobx-react'
import _ from 'lodash'

import {
  registerSidePanelView
} from './actions'
import PanelState from './state'


@inject((__, { side }) => {
  let { activeViewId, labels } = PanelState.sidePanelViews[side]
  if (!activeViewId) activeViewId = ''
  return { activeViewId, labels }
})
class SidePanelContainer extends Component {
  componentWillMount () {
    const children = this.getChildren()
    const { side } = this.props

    registerSidePanelView({
      side,
      labels: children.map((sidePanelView, idx) => ({
        ...sidePanelView.props.label,
        viewId: `${side}_${idx}`,
        key: sidePanelView.key || idx
      })),
      activeViewId: `${side}_${children.reduce((activeViewIndex, sidePanelView, idx) => {
        if (sidePanelView.props.active) activeViewIndex = idx
        return activeViewIndex
      }, 0)}`
    })
  }

  getChildren () {
    if (!this.props.children) return []
    return Array.isArray(this.props.children) ? this.props.children : [this.props.children]
  }

  render () {
    const { labels = [] } = this.props
    const children = this.getChildren()
    const activeViewIndex = Number(this.props.activeViewId.split('_')[1]) || 0
    const viewsMapping = labels
    .filter(label => label.key && PanelState.views[label.key])
    .map(label => PanelState.views[label.key])
    // .sort((a, b) => a.weight || 1 - b.weight || 1)
    const childrenWithView = children.concat(viewsMapping);
    return (<div style={{ height: '100%' }}>
      {childrenWithView.map((child, idx) =>
        <SidePanelViewContent key={idx}
          view={child}
          isActive={activeViewIndex ? activeViewIndex === idx : idx === 0}
        />
      )}
    </div>)
  }
}

const SidePanelViewContent = ({ isActive, view }) =>
<div style={{ height: '100%', display: isActive ? 'block' : 'none' }}>
  {view}
</div>

class SidePanelView extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return this.props.children
  }
}


export { SidePanelContainer, SidePanelView }
