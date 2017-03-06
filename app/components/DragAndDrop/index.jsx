/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'
import { updateDragOverTarget, updateDragOverMeta, dragEnd, dragStart } from './actions'
import * as PaneActions from '../Pane/actions'
import * as TabActions from '../Tab/actions'
import * as FileTreeActions from '../FileTree/actions'
import uuid from 'uuid'

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
    window.ondragleave = this.onDragLeave
  }
  onDragLeave = (e) => {
    console.log('ondragleave', e)
    e.preventDefault()
    const {source = {}, dispatch} = this.props
    if (source.type && source.type === 'File_Outside') {
      setTimeout(() => {
        // if (this.props.source && this.props.source.id === firstId) {
        //   console.log('s', this.props.source)
        //   console.log('out')
        //   return
        // }
        dispatch(dragEnd())
      }, 5000)
    }
  }
  onDragOver = (e) => {
    e.preventDefault()
    const {source, droppables = [], dispatch, meta} = this.props
    const prevTarget = this.props.target
    if (!source) {
      dispatch(dragStart({
        sourceType: 'File_Outside',
        sourceId: uuid.v1()
      }))
    }
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
    // if (!prevTarget || target.id !== prevTarget.id) {
      dispatch(updateDragOverTarget({id: target.id, type: target.type }))
    // }
    console.log('overer', `${source.type}_on_${target.type}`)
    switch (`${source.type}_on_${target.type}`) {
      case 'TAB_on_PANE':
        return this.dragTabOverPane(e, target)
      case 'File_Outside_on_FILE_TREE_NODE':
        return this.dragTabOverFileTree(e, target)
      case 'TAB_on_TABBAR':
      case 'TAB_on_TABLABEL':
        return this.dragTabOverTabBar(e, target)

      default:
    }
  }

  onDrop = (e) => {
    e.preventDefault()
    const {source, target, meta, dispatch} = this.props
    if (!source || !target) return
    switch (`${source.type}_on_${target.type}`) {
      case 'TAB_on_PANE':
        dispatch(PaneActions.splitTo(target.id, meta.paneSplitDirection))
          .then(newPaneId => {
            dispatch(TabActions.moveTabToPane(source.id, newPaneId))
          })
        break
      case 'File_Outside_on_FILE_TREE_NODE':
        dispatch(FileTreeActions.uploadFilesToPath(e.dataTransfer.files, target.id))
        break;
      case 'TAB_on_TABBAR':
        dispatch(TabActions.moveTabToGroup(source.id, target.id.replace('tab_bar_', '')))
        break

      case 'TAB_on_TABLABEL':
        dispatch(TabActions.insertTabAt(source.id, target.id.replace('tab_label_', '')))
        break

      default:

    }
    dispatch(dragEnd())
  }

  onDragEnd = (e) => {
    e.preventDefault()
    const {dispatch} = this.props
    dispatch(dragEnd())
  }

  dragTabOverTabBar (e, target) {
    const {dispatch} = this.props
    if (target.type !== 'TABLABEL' && target.type !== 'TABBAR') return
    if (target.type === 'TABLABEL') {
      dispatch(updateDragOverMeta({tabLabelTargetId: target.id}))
    } else {
      dispatch(updateDragOverMeta({tabBarTargetId: target.id}))
    }
  }

  dragTabOverFileTree (e, target) {
    const id = target.id
    console.log('id', id)
    if (id.split('_')[0] === 'folder') {
      // const DOMNode = document.getElementById(target.id)
      // DOMNode.firstChild.firstChild.click()
    }
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
