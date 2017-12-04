import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import Panel from './Panel'

class PanelAxis extends Component {
  static propTypes = {
    id: PropTypes.string,
    panel: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
  };

  render () {
    const { panel, className, style } = this.props
    let subviews
    if (panel.views.length) {
      subviews = panel.views.map(childPanel =>
        <Panel key={childPanel.id} panel={childPanel} parentFlexDirection={panel.direction} />
      )
    } else {
      subviews = <Panel panel={panel} parentFlexDirection={panel.direction} />
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
