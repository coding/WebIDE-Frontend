import React, { Component } from 'react'
import { dispatch } from '../store'
import { observer } from 'mobx-react'
import { dnd } from 'utils'
import * as PaneActions from './Pane/actions'
import * as TabActions from 'commons/Tab/actions'
import * as FileTreeActions from './FileTree/actions'

// Corner case: file dragging doesn't trigger 'dragend' natively
// so need to patch for this behavior
function isFileDragEnd (e) {
  return (e.screenX === 0 && e.screenY === 0 && e.dataTransfer.files.length)
}

@observer
class DragAndDrop extends Component {

  constructor (props) {
    super(props)
  }

  render () {
    const { isDragging, meta, target } = dnd
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
    e.preventDefault()
    if (isFileDragEnd(e)) dnd.dragEnd()
  }

  onDragOver = (e) => {
    e.preventDefault()
    const { source, droppables = [], meta } = dnd
    if (!source) {
      dnd.dragStart({
        type: 'EXTERNAL_FILE',
        id: Date.now(),
      })
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

    dnd.dragOver({ id: target.id, type: target.type })

    switch (`${source.type}_on_${target.type}`) {
      case 'TAB_on_PANE':
        return this.dragTabOverPane(e, target)
      case 'EXTERNAL_FILE_on_FILE_TREE_NODE':
        return this.dragTabOverFileTree(e, target)
      case 'TAB_on_TABBAR':
      case 'TAB_on_TABLABEL':
        return this.dragTabOverTabBar(e, target)

      default:
    }
  }

  onDrop = (e) => {
    e.preventDefault()
    const { source, target, meta } = dnd
    if (!source || !target) return
    switch (`${source.type}_on_${target.type}`) {
      case 'TAB_on_PANE':
        dispatch(PaneActions.splitTo(target.id, meta.paneSplitDirection))
          .then(newPaneId => {
            dispatch(TabActions.moveTabToPane(source.id, newPaneId))
          })
        break
      case 'EXTERNAL_FILE_on_FILE_TREE_NODE':
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
    dnd.dragEnd()
  }

  onDragEnd = (e) => {
    e.preventDefault()
    dnd.dragEnd()
  }

  dragTabOverTabBar (e, target) {
    if (target.type !== 'TABLABEL' && target.type !== 'TABBAR') return
    if (target.type === 'TABLABEL') {
      dnd.updateDragOverMeta({tabLabelTargetId: target.id})
    } else {
      dnd.updateDragOverMeta({tabBarTargetId: target.id})
    }
  }

  dragTabOverFileTree (e, target) {
    const id = target.id
    if (id.split('_')[0] === 'folder') {
      const DOMNode = document.getElementById(target.id)
      DOMNode.firstChild.click()
    }
  }
  dragTabOverPane (e, target) {
    if (target.type !== 'PANE') return
    const { meta } = dnd
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

    dnd.updateDragOverMeta({
      paneSplitDirection: overlayPos,
      paneLayoutOverlay: overlay
    })
  }
}

export default DragAndDrop
