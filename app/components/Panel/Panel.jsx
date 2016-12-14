/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import cx from 'classnames'
import PanelAxis from './PanelAxis'
import PanelContent from './PanelContent'
import * as PanelActions from './actions'

const _Panel = (props) => {
  const { panel, parentDirection, dispatch } = props
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
      className={cx('panel-container', parentDirection)}
    > { panel.views.length
        ? <PanelAxis panel={panel} />
        : <div className='panel'><PanelContent panel={panel} /></div>
      }
      {panel.disableResizeBar
        ? null
        : <ResizeBar parentDirection={parentDirection} sectionId={panel.id} />
      }
    </div>
  )
}

_Panel.propTypes = {
  panel: PropTypes.object,
  parentDirection: PropTypes.string,
}

const Panel = connect((state, { panelId }) =>
  ({ panel: state.PanelState.panels[panelId] })
)(_Panel)

Panel.propTypes = {
  panelId: PropTypes.string,
  parentDirection: PropTypes.string,
}


let ResizeBar = ({parentDirection, sectionId, startResize}) => {
  var barClass = (parentDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)}
      onMouseDown={e => startResize(sectionId, e)}></div>
  )
}

ResizeBar = connect(null, (dispatch, ownProps) => {
  return {
    startResize: (sectionId, e) => {
      if (e.button !== 0) return // do nothing unless left button pressed
      e.preventDefault()

      // dispatch(PanelActions.setCover(true))
      var [oX, oY] = [e.pageX, e.pageY]

      const handleResize = (e) => {
        var [dX, dY] = [oX - e.pageX, oY - e.pageY];
        [oX, oY] = [e.pageX, e.pageY];
        dispatch(PanelActions.resize(sectionId, dX, dY))
        ownProps.resizingListeners.forEach(listener => listener())
      }

      const stopResize = () => {
        window.document.removeEventListener('mousemove', handleResize)
        window.document.removeEventListener('mouseup', stopResize)
        dispatch(PanelActions.confirmResize())
      }

      window.document.addEventListener('mousemove', handleResize)
      window.document.addEventListener('mouseup', stopResize)
    }
  }
})(ResizeBar)

export default Panel
