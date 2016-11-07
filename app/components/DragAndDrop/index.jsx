/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { dragOverTarget, updateDragOverMeta, dragEnd } from './actions'
import * as PaneActions from '../Pane/actions'
import * as TabActions from '../Tab/actions'

@connect(state => state.DragAndDrop)
class DragAndDrop extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    const {isDragging, meta, target} = this.props
    if (!isDragging) return null

    if (meta && meta.paneLayoutOverlay) {
      const {top, left, width, height} = meta.paneLayoutOverlay
      var overlayStyle = {
        position: 'fixed',
        top: top,
        left: left,
        width: width,
        height: height,
        opacity: 0.2
      }
    }

    return meta && meta.paneLayoutOverlay
      ? <div className='pane-layout-overlay' style={overlayStyle}></div>
      : null
  }

  componentDidMount () {
    window.ondragover = this.onDragOver
    window.ondrop = this.onDrop
    window.ondragend = this.onDragEnd
  }

  onDragOver = (e) => {
    e.preventDefault()
    const {source, droppables, dispatch, meta} = this.props
    const prevTarget = this.props.target

    const [oX, oY] = [e.pageX, e.pageY]
    const target = droppables.reduce((result, droppable) => {
      const {top, left, right, bottom} = droppable.rect
      if (left <= oX && oX <= right && top <= oY && oY <= bottom) {
        if (!result) return droppable
        return result.DOMNode.contains(droppable.DOMNode) ? droppable : result
      } else {
        return result
      }
    }, null)

    if (!target) return
    if (!prevTarget || target.id !== prevTarget.id) {
      dispatch(dragOverTarget({id: target.id, type: target.type}))
    }

    switch (source.type) {
      case 'TAB':
        return this.dragTabOverPane(e, target)

      default:
    }
  }

  onDrop = (e) => {
    e.preventDefault()
    const {source, target, meta, dispatch} = this.props
    if (!source || !target) return
    switch (`${source.type}_to_${target.type}`) {
      case 'TAB_to_PANE':
        dispatch(PaneActions.splitTo(target.id, meta.paneSplitDirection))
          .then(newPane => {
            let tabGroupId = newPane.views[0]
            dispatch(TabActions.moveTabToGroup(source.id, tabGroupId))
          })
    }
    dispatch(dragEnd())
  }

  onDragEnd = (e) => {
    e.preventDefault()
    const {dispatch} = this.props
    dispatch(dragEnd())
  }

  dragTabOverPane (e, target) {
    if (target.type !== 'PANE') return
    const {meta, dispatch} = this.props
    const [oX, oY] = [e.pageX, e.pageY]

    const {top, left, right, bottom, height, width} = target.rect
    const leftRule = left + width/3
    const rightRule = right - width/3
    const topRule = top + height/3
    const bottomRule = bottom - height/3

    let overlayPos
    if (oX < leftRule) {
      overlayPos = 'left'
    } else if (oX > rightRule) {
      overlayPos = 'right'
    } else if (oY < topRule) {
      overlayPos = 'top'
    } else if (oY > bottomRule) {
      overlayPos = 'bottom'
    } else {
      overlayPos = 'center'
    }

    // nothing changed, stop here
    if (meta && meta.paneSplitDirection === overlayPos) return

    const heightTabBar = target.DOMNode.querySelector('.tab-bar').offsetHeight
    let overlay
    switch (overlayPos) {
      case 'left':
        overlay = {
          top: top + heightTabBar,
          left: left,
          width: width/2,
          height: height - heightTabBar
        }
        break
      case 'right':
        overlay = {
          top: top + heightTabBar,
          left: left + width/2,
          width: width/2,
          height: height - heightTabBar
        }
        break
      case 'top':
        overlay = {
          top: top + heightTabBar,
          left: left,
          width: width,
          height: (height - heightTabBar)/2
        }
        break
      case 'bottom':
        overlay = {
          top: top + (height + heightTabBar)/2,
          left: left,
          width: width,
          height: (height - heightTabBar)/2
        }
        break
      default:
        overlay = {
          top: top + heightTabBar,
          left: left,
          width: width,
          height: height - heightTabBar
        }
    }

    dispatch(updateDragOverMeta({
      paneSplitDirection: overlayPos,
      paneLayoutOverlay: overlay
    }))
  }
}

export default DragAndDrop
