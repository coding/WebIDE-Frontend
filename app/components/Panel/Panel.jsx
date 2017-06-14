import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import cx from 'classnames'
import PanelAxis from './PanelAxis'
import PanelContent from './PanelContent'
import { confirmResize } from './actions'
import ResizeBar from '../ResizeBar'

const _Panel = (props) => {
  const { panel, parentFlexDirection, confirmResize } = props
  let style = {}
  if (panel.resizable) {
    style.flexGrow = panel.size
  } else {
    style.flexGrow = 0
    style.flexBasis = 'auto'
  }
  if (panel.hide) style.display = 'none'
  if (panel.disabled) style.display = 'none'
  if (panel.overflow) style.overflow = panel.overflow

  return (
    <div id={panel.id}
      style={style}
      className={cx(
        'panel-container',
        parentFlexDirection,
        { resizable: style.flexGrow }
      )}
    > { panel.views.length
        ? <PanelAxis panel={panel} />
        : <div className='panel'><PanelContent panel={panel} /></div>
      }
      {panel.disableResizeBar
        ? null
        : <ResizeBar viewId={panel.id}
          confirmResize={confirmResize}
          parentFlexDirection={parentFlexDirection} />
      }
    </div>
  )
}

_Panel.propTypes = {
  panel: PropTypes.object,
  parentFlexDirection: PropTypes.string,
}

const Panel = connect(
  (state, { panelId }) => ({ panel: state.PanelState.panels[panelId] }),
  dispatch => bindActionCreators({ confirmResize }, dispatch)
)(_Panel)

Panel.propTypes = {
  panelId: PropTypes.string,
  parentFlexDirection: PropTypes.string,
}

export default Panel
