import React, { Component } from 'react'
import debounce from 'lodash/debounce'
import { dispatch } from '../store'
import mobxStore from '../mobxStore'
import { observer } from 'mobx-react'
import { action, runInAction } from 'mobx'
import { dnd } from 'utils'
import * as PaneActions from './Pane/actions'
import PaneState from './Pane/state'
import * as TabActions from 'components/Tab/actions'
import * as FileTreeActions from './FileTree/actions'
import FileTreeState from './FileTree/state'

// Corner case: file dragging doesn't trigger 'dragend' natively
// so need to patch for this behavior
function isFileDragEnd (e) {
  return (e.screenX === 0 && e.screenY === 0 && e.dataTransfer.files.length)
}

@observer
class DragAndDrop extends Component {

  constructor (props) {
    super(props)
    this.state = {
      dragPos: {
        x: 0,
        y: 0,
      }
    }
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
    this.dragLeaveTree = true
    this.resetDragPos()
    e.preventDefault()
    if (isFileDragEnd(e)) dnd.dragEnd()
  }

  onDragOver = (e) => {
    e.preventDefault()
    const dx = this.state.dragPos.x - e.x
    const dy = this.state.dragPos.y - e.y
    if ((dx < -5 || dx > 5) || (dy < -5 || dy > 5)) {
      const { source } = dnd
      this.state.dragPos = {
        x: e.x,
        y: e.y,
      }
      if (!source || !source.id) {
        dnd.dragStart({
          type: 'EXTERNAL_FILE',
          id: Date.now(),
        })
      }
      this.handleDropOver(e)
    }
  }

  resetDragPos = () => {
    this.state.dragPos = {
      x: 0,
      y: 0,
    }
    this.unhighlightDirNode()
    this.handleDropOver.cancel()
  }

  unhighlightDirNode = debounce(() => {
    if (this.highlightNode && this.dragLeaveTree) {
      FileTreeActions.unhighlightDirNode(this.highlightNode)
      this.highlightNode = null
    }
  }, 400)

  handleDropOver = debounce((e) => {
    dnd.updateDroppables()
    const { source, droppables = [], meta } = dnd
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
        this.dragLeaveTree = false
        return this.dragTabOverFileTree(e, target)
      case 'FILE_TREE_NODE_on_FILE_TREE_NODE':
        this.dragLeaveTree = false
        return this.dragTabOverFileTree(e, target)
      case 'TAB_on_TABBAR':
      case 'TAB_on_TABLABEL':
        return this.dragTabOverTabBar(e, target)

      default:
    }
  }, 200, {
    leading: false,
  })

  onDrop = (e) => {
    this.dragLeaveTree = true
    this.resetDragPos()
    e.preventDefault()
    const { source, target, meta } = dnd
    if (!source || !target) return
    switch (`${source.type}_on_${target.type}`) {
      case 'TAB_on_PANE':
        PaneActions.splitTo(target.id, meta.paneSplitDirection).then(newPaneId =>
          TabActions.moveTabToPane(source.id, newPaneId)
        )
        break

      case 'EXTERNAL_FILE_on_FILE_TREE_NODE':
        FileTreeActions.uploadFilesToPath(e.dataTransfer.files, target.id)
        break

      case 'FILE_TREE_NODE_on_FILE_TREE_NODE':
        const node = FileTreeState.entities.get(target.id)
        if (node.isDir) {
          FileTreeActions.mv(source.id, target.id)
        } else {
          const parentNode = node.parent
          FileTreeActions.mv(source.id, parentNode.id)
        }
        break

      case 'TAB_on_TABBAR':
        TabActions.moveTabToGroup(source.id, target.id.replace('tab_bar_', ''))
        break

      case 'TAB_on_TABLABEL':
        TabActions.insertTabBefore(source.id, target.id.replace('tab_label_', ''))
        break

      default:

    }
    dnd.dragEnd()
  }

  onDragEnd = (e) => {
    this.resetDragPos()
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
    const { id, DOMNode } = target
    const node = FileTreeState.entities.get(id)
    if (node.isDir) {
      if (node.isFolded) {
        FileTreeActions.openNode(node)
      }
      if (!node.isHighlighted) {
        if (this.highlightNode) {
          FileTreeActions.unhighlightDirNode(this.highlightNode)
        }
        this.highlightNode = node
        FileTreeActions.highlightDirNode(node)
      }
    } else {
      const parentNode = node.parent
      if (!parentNode.isHighlighted) {
        if (this.highlightNode) {
          FileTreeActions.unhighlightDirNode(this.highlightNode)
        }
        this.highlightNode = parentNode
        FileTreeActions.highlightDirNode(parentNode)
      }
    }
  }

  dragTabOverPane (e, target) {
    if (target.type !== 'PANE') return
    const { source, meta } = dnd
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

    if (mobxStore.PaneState.autoCloseEmptyPane) {
      const sourceTab = mobxStore.EditorTabState.tabs.get(source.id)
      const targetPane = mobxStore.PaneState.panes.get(target.id)
      const isLonelyTab = sourceTab.tabGroup.tabs.length === 1
      if (isLonelyTab && targetPane.tabGroup === sourceTab.tabGroup) {
        overlayPos = 'center'
      }
    }

    // nothing changed, stop here
    if (meta && meta.paneSplitDirection === overlayPos &&
        meta.targetId === target.id) return

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
      paneLayoutOverlay: overlay,
      targetId: target.id,
    })
  }
}

export default DragAndDrop
