/* @flow weak */
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import Panel from './Panel'
// import * as PanelActions from './actions'

class PanelAxis extends Component {
  static propTypes = {
    id: PropTypes.string,
    panel: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
  };

  static childContextTypes = {
    onResizing: PropTypes.func
  };

  constructor (props) {
    super(props)
    this.resizingListeners = []
  }

  getChildContext () {
    return { onResizing: this.onResizing.bind(this) }
  }

  onResizing (listener) {
    this.resizingListeners.push(listener)
  }

  render () {
    const { panel, className, style } = this.props
    let subviews
    if (panel.views.length) {
      subviews = panel.views.map(panelId =>
        <Panel key={panelId} panelId={panelId} parentDirection={panel.direction} />
      )
    } else {
      subviews = <Panel panelId={panel.id} parentDirection={panel.direction} />
    }

    return (
      <div id={this.props.id}
        className={cx('panel-axis', className)}
        style={{ flexDirection: panel.direction, ...style }}
      >{subviews}</div>
    )
  }
}

export default PanelAxis
