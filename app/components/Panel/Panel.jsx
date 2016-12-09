/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import cx from 'classnames'
import PanelAxis from './PanelAxis'
import * as PanelActions from './actions'

const Panel = ({id, views, size, flexDirection, parentFlexDirection, resizingListeners, ..._props}) => {
  var style = {
    flexGrow: size,
    display: _props.display
  }

  return (
    <div id={id} style={style} className={cx('panel-container', parentFlexDirection)}>
      { views.length > 1
        ? <PanelAxis views={views} flexDirection={flexDirection} />
        : <div className='panel'>{ views[0] }</div>
      }
      <ResizeBar parentFlexDirection={parentFlexDirection}
        sectionId={id} resizingListeners={resizingListeners} />
    </div>
  )
}

let ResizeBar = ({parentFlexDirection, sectionId, startResize}) => {
  var barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
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
