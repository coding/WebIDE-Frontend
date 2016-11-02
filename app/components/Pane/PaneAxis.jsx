/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import cx from 'classnames'
import * as PaneActions from './actions'
import TabViewContainer from '../Tab'
import AceEditor from '../AceEditor'


@connect(state => state.PaneState)
class Pane extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const {id, views, size, flexDirection, parentFlexDirection, resizingListeners, dropArea} = this.props
    var content
    if (views.length > 1) {
      content = <PaneAxis views={views} flexDirection={flexDirection} />
    } else if (typeof views[0] === 'string') {
      var tabGroupId = views[0]
      content = (
        <div className='pane'>
          <TabViewContainer defaultContentClass={AceEditor} defaultContentType='editor' tabGroupId={tabGroupId}/>
        </div>
      )
    } else {
      content = null
    }

    var style = {flexGrow: size, display: this.props.display}
    return (
      <div id={id}
        style={style}
        className={cx('pane-container', parentFlexDirection)}
        data-droppable='PANE'
        ref={r => this.paneDOM = r}
      > { content }
        <ResizeBar sectionId={id}
          parentFlexDirection={parentFlexDirection}
          resizingListeners={resizingListeners}
          startResize={this.startResize} />
      </div>
    )
  }

  startResize = (sectionId, e) => {
    if (e.button !== 0) return // do nothing unless left button pressed
    e.preventDefault()

    // dispatch(PaneActions.setCover(true))
    var [oX, oY] = [e.pageX, e.pageY]

    const handleResize = (e) => {
      var [dX, dY] = [oX - e.pageX, oY - e.pageY]
      ;[oX, oY] = [e.pageX, e.pageY]
      this.props.dispatch(PaneActions.resize(sectionId, dX, dY))
      this.props.resizingListeners.forEach(listener => listener())
    }

    const stopResize = () => {
      window.document.removeEventListener('mousemove', handleResize)
      window.document.removeEventListener('mouseup', stopResize)
      this.props.dispatch(PaneActions.confirmResize())
    }

    window.document.addEventListener('mousemove', handleResize)
    window.document.addEventListener('mouseup', stopResize)
  }

}


const ResizeBar = ({parentFlexDirection, sectionId, startResize}) => {
  var barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)}
      onMouseDown={e => startResize(sectionId, e)}></div>
  )
}


class PaneAxis extends Component {
  static get propTypes () {
    return {
      id: PropTypes.string,
      flexDirection: PropTypes.string,
      views: PropTypes.array,
      size: PropTypes.number
    }
  }

  static get childContextTypes ()  {
    return { onResizing: PropTypes.func }
  }


  getChildContext () {
    return {
      onResizing: this.onResizing.bind(this)
    }
  }

  onResizing (listener) {
    this.resizingListeners.push(listener)
  }

  constructor (props) {
    super(props)
    this.resizingListeners = []
  }

  render () {
    let props = this.props.hasOwnProperty('root') ? this.props.root : this.props
    let { views, flexDirection } = props
    if (views.length === 1 && !Array.isArray(views[0].views) ) views = [props]
    var Subviews = views.map( _props => {
      return <Pane
        key={_props.id}
        id={_props.id}
        views={_props.views}
        size={_props.size}
        flexDirection={_props.flexDirection}
        parentFlexDirection={flexDirection}
        resizingListeners={this.resizingListeners}
        {..._props}
      />
    })

    return (
      <div id={this.props.id}
        className={cx('pane-axis', this.props.className)}
        style={{flexDirection: flexDirection, ...this.props.style}}>{ Subviews }</div>
    )
  }
}

export default PaneAxis
