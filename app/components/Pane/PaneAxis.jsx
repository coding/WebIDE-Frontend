/* @flow weak */
import React, { Component, PropTypes } from 'react';
import { createStore } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as PaneActions from './actions';
import TabContainer from '../Tab';
import EditorWrapper from '../EditorWrapper';


// class Pane extends Component {
//   constructor (props) {
//     super(props)
//   }

//   render () {
//     const {
//       id,
//       views,
//       size,
//       flexDirection,
//       parentFlexDirection,
//       resizingListeners,
//       dropArea
//     } = this.props;
//     var content
//     if (views.length > 1) {
//       content = <PaneAxis views={views} flexDirection={flexDirection} />
//     } else if (typeof views[0] === 'string') {
//       var tabGroupId = views[0];
//       content = (
//         <div className='pane'>
//           <TabContainer
//             defaultContentClass={EditorWrapper}
//             defaultContentType='editor'
//             tabGroupId={tabGroupId}/>
//         </div>
//       )
//     } else {
//       content = null
//     }

//     var style = {flexGrow: size, display: this.props.display}
//     return (
//       <div id={id}
//         style={style}
//         className={cx('pane-container', parentFlexDirection)}
//         data-droppable='PANE'
//         ref={r => this.paneDOM = r}
//       > { content }
//         <ResizeBar sectionId={id}
//           parentFlexDirection={parentFlexDirection}
//           resizingListeners={resizingListeners}
//           startResize={this.startResize} />
//       </div>
//     )
//   }

  // startResize = (sectionId, e) => {
  //   if (e.button !== 0) return // do nothing unless left button pressed
  //   e.preventDefault()

  //   const { resizingListeners, dispatch } = this.props
  //   // dispatch(PaneActions.setCover(true))
  //   var [oX, oY] = [e.pageX, e.pageY]

  //   const handleResize = (e) => {
  //     var [dX, dY] = [oX - e.pageX, oY - e.pageY]
  //     ;[oX, oY] = [e.pageX, e.pageY]

  //     console.log('offset', dX, oX);
  //     dispatch(PaneActions.resize(sectionId, dX, dY))
  //     Array.isArray(resizingListeners) && resizingListeners.forEach(listener => listener())
  //   }

  //   const stopResize = () => {
  //     window.document.removeEventListener('mousemove', handleResize)
  //     window.document.removeEventListener('mouseup', stopResize)
  //     dispatch(PaneActions.confirmResize())
  //   }

  //   window.document.addEventListener('mousemove', handleResize)
  //   window.document.addEventListener('mouseup', stopResize)
  // }

// }


const _Pane = (props) => {
  const { pane, parentFlexDirection, dispatch } = props
  const { id, views, size, flexDirection, display } = pane

  const style = {flexGrow: size, display: display}
  return (
    <div id={id}
      style={style}
      className={cx('pane-container', parentFlexDirection)}
      data-droppable='PANE'
    > {
        views.length > 1
        ? <PaneAxis pane={pane} />
        : typeof views[0] === 'string'
        ? <div className='pane'>
            <TabContainer tabGroupId={views[0]} containingPaneId={pane.id}
              defaultContentClass={EditorWrapper} defaultContentType='editor'
            />
          </div>
        : null
      }
      <ResizeBar sectionId={id} dispatch={dispatch} parentFlexDirection={parentFlexDirection} />
    </div>
  )
}

_Pane.propTypes = {
  pane: PropTypes.object,
  parentFlexDirection: PropTypes.string,
}

const Pane = connect((state, { paneId }) => {
  return { pane: state.PaneState.panes[paneId] }
})(_Pane)


const ResizeBar = ({parentFlexDirection, sectionId, dispatch}) => {
  var barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)}
      onMouseDown={e => dispatch(PaneActions.startResize(e, sectionId))}></div>
  )
}

// const startResize = (sectionId, e) => {
//   if (e.button !== 0) return // do nothing unless left button pressed
//   e.preventDefault()

//   const { resizingListeners, dispatch } = this.props
//   // dispatch(PaneActions.setCover(true))
//   var [oX, oY] = [e.pageX, e.pageY]

//   const handleResize = (e) => {
//     var [dX, dY] = [oX - e.pageX, oY - e.pageY]
//     ;[oX, oY] = [e.pageX, e.pageY]

//     dispatch(PaneActions.resize(sectionId, dX, dY))
//     Array.isArray(resizingListeners) && resizingListeners.forEach(listener => listener())
//   }

//   const stopResize = () => {
//     window.document.removeEventListener('mousemove', handleResize)
//     window.document.removeEventListener('mouseup', stopResize)
//     dispatch(PaneActions.confirmResize())
//   }

//   window.document.addEventListener('mousemove', handleResize)
//   window.document.addEventListener('mouseup', stopResize)
// }


class PaneAxis extends Component {
  static propTypes = {
    id: PropTypes.string,
    pane: PropTypes.object,
  };

  static childContextTypes = { onResizing: PropTypes.func }
  getChildContext () { return { onResizing: this.onResizing.bind(this) } }
  onResizing (listener) { if (typeof listener === 'function') { this.resizingListeners.push(listener) } }

  constructor (props) {
    super(props)
    this.resizingListeners = []
  }

  render () {
    let { pane } = this.props
    let Subviews
    if (pane.views.length === 1 && !Array.isArray(pane.views[0].views) ) {
      Subviews = <Pane paneId={pane.id} parentFlexDirection={pane.flexDirection} />
    } else {
      Subviews = pane.views.map(paneId =>
        <Pane key={paneId} paneId={paneId} parentFlexDirection={pane.flexDirection} />
      )
    }

    return (
      <div id={this.props.id}
        className={cx('pane-axis', this.props.className)}
        style={{flexDirection: pane.flexDirection, ...this.props.style}}
      >{ Subviews }
      </div>
    )
  }
}

export default PaneAxis
