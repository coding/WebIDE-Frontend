/* @flow weak */
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import Panel from './Panel'
// import * as PanelActions from './actions'

class PanelAxis extends Component {
  static propTypes = {
    id: PropTypes.string,
    flexDirection: PropTypes.string,
    views: PropTypes.array,
    size: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
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
    const { flexDirection, className, style } = this.props
    let views = this.props.views
    if (views.length === 1 && !Array.isArray(views[0].views)) views = [this.props]
    const Subviews = views.map(_props =>
      <Panel
        key={_props.id}
        id={_props.id}
        views={_props.views}
        size={_props.size}
        flexDirection={_props.flexDirection}
        parentFlexDirection={flexDirection}
        resizingListeners={this.resizingListeners}
        {..._props}
      />
    )

    return (
      <div className={cx('panel-axis', className)}
        style={{ flexDirection, ...style }}
      >{Subviews}</div>
    )
  }
}

export default PanelAxis
