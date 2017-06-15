import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import {
  registerSidePanelView
} from './actions'

@connect((state, { side }) => {
  let { activeViewId } = state.PanelState.sidePanelViews[side]
  if (!activeViewId) activeViewId = ''
  return { activeViewId }
})
class SidePanelContainer extends Component {
  constructor (props) {
    super(props)
    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
    const { side, dispatch } = this.props

    dispatch(registerSidePanelView({
      side,
      labels: children.map((sidePanelView, idx) => ({
        ...sidePanelView.props.label,
        viewId: `${side}_${idx}`,
      })),
      activeViewId: `${side}_${children.reduce((activeViewIndex, sidePanelView, idx) => {
        if (sidePanelView.props.active) activeViewIndex = idx
        return activeViewIndex
      }, 0)}`
    }))
  }

  render () {
    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
    const activeViewIndex = Number(this.props.activeViewId.split('_')[1])
    return (<div style={{ height: '100%' }}>
      {children.map((child, idx) =>
        <SidePanelViewContent key={idx}
          view={child}
          isActive={activeViewIndex ? activeViewIndex === idx : idx === 0}
        />
      )}
    </div>)
  }
}

const SidePanelViewContent = ({ isActive, view }) => <div style={{ height: '100%', display: isActive ? 'block' : 'none' }}>{view}</div>

class SidePanelView extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return this.props.children
  }
}


export { SidePanelContainer, SidePanelView }
