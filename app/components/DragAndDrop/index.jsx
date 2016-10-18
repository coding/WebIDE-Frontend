/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { dragOver } from './actions'

@connect(state => state.DragAndDrop)
class DragAndDrop extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    const {paneLayoutOverlay, isDragging} = this.props
    if (!isDragging) return null

    if (paneLayoutOverlay) {
      const {top, left, width, height} = paneLayoutOverlay
      var overlayStyle = {
        position: 'fixed',
        top: top,
        left: left,
        width: width,
        height: height,
        opacity: 0.2
      }
    }

    return paneLayoutOverlay
      ? <div className='pane-layout-overlay' style={overlayStyle}></div>
      : null
  }

  componentDidMount () {
    window.ondragover = this.onDragOver
  }

  onDragOver = (e) => {
    const {sourceType, sourceId, droppables, dispatch} = this.props

    const [oX, oY] = [e.pageX, e.pageY]
    const targetDroppable = _.find(droppables, droppable => {
      const {top, left, right, bottom} = droppable.rect
      return (left <= oX && oX <= right && top <= oY && oY <= bottom)
    })
    if (!targetDroppable) return

    switch (sourceType) {
      case 'TAB':
        const {top, left, right, bottom, height, width} = targetDroppable.rect
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
        // if (this.overlayPos === overlayPos) return
        // this.overlayPos = overlayPos

        const heightTabBar = targetDroppable.element.querySelector('.tab-bar').offsetHeight
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

        dispatch(dragOver({
          paneLayoutOverlay: overlay
        }))
        break

      default:
        break
    }
    // dispatch(PaneActions.dragOverPane({
    //   ...paneLayoutOverlay,
    //   direction: overlayPos
    // }))
  }
}

export default DragAndDrop
