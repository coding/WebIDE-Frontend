import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import cx from 'classnames'
import Pane from './Pane'

@observer
class PaneAxis extends Component {
  static propTypes = {
    id: PropTypes.string,
    pane: PropTypes.object,
  };

  static childContextTypes = { onResizing: PropTypes.func };

  constructor (props) {
    super(props)
    this.resizingListeners = []
  }

  getChildContext () { return { onResizing: this.onResizing.bind(this) } }
  onResizing (listener) { if (typeof listener === 'function') { this.resizingListeners.push(listener) } }

  render () {
    const selfPane = this.props.pane
    let Subviews
    if (selfPane.views.length) {
      Subviews = selfPane.views.map(pane =>
        <Pane key={pane.id} pane={pane} parentFlexDirection={selfPane.flexDirection} />
      )
    } else {
      Subviews = <Pane pane={selfPane} parentFlexDirection={selfPane.flexDirection} />
    }

    return (
      <div id={this.props.id}
        className={cx('pane-axis', this.props.className)}
        style={{ flexDirection: selfPane.flexDirection, ...this.props.style }}
      >{Subviews}
      </div>
    )
  }
}

export default PaneAxis
