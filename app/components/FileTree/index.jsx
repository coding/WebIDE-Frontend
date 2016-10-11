/* @flow weak */
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import ContextMenu from '../ContextMenu'
import * as FileTreeActions from './actions'
import FileTreeContextMenuItems from './contextMenuItems'
import subscribeToFileChange from './subscribeToFileChange'


class FileTree extends Component {
  constructor(props) {
    super(props)
  }

  state = {
    isContextMenuActive: false,
    contextMenuPos: {x:0, y:0},
    contextNode: null
  }

  componentDidMount() {
    subscribeToFileChange()
    this.props.initializeFileTree()
  }

  render() {
    const {FileTreeState, ...actionProps} = this.props
    const {isContextMenuActive, contextMenuPos} = this.state
    return (
      <div className='filetree-container' tabIndex={1} onKeyDown={this.onKeyDown}>
        <FileTreeNode node={FileTreeState.rootNode}
          onContextMenu={this.onContextMenu} {...actionProps} />
        <ContextMenu items={FileTreeContextMenuItems}
          isActive={isContextMenuActive}
          pos={contextMenuPos}
          context={this.state.contextNode}
          deactivate={this.setState.bind(this, {isContextMenuActive: false})} />
      </div>
    )
  }

  onContextMenu = (e, node) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({
      isContextMenuActive: true,
      contextMenuPos: {x:e.clientX, y:e.clientY},
      contextNode: node
    })
  }

  onKeyDown = (e) => {
    var curNode = this.props.FileTreeState.focusedNodes[0]
    if (e.keyCode === 13 || 37 <= e.keyCode && e.keyCode <= 40) e.preventDefault()
    switch (e.key) {
      case 'ArrowDown':
        this.props.selectNode(1)
        break
      case 'ArrowUp':
        this.props.selectNode(-1)
        break
      case 'ArrowRight':
        if (!curNode.isDir) break
        if (curNode.isFolded) {
          this.props.openNode(curNode, false)
        } else {
          this.props.selectNode(1)
        }
        break
      case 'ArrowLeft':
        if (!curNode.isDir || curNode.isFolded) {
          this.props.selectNode(curNode.parent)
          break
        }
        if (curNode.isDir) this.props.openNode(curNode, true)
        break
      case 'Enter':
        this.props.openNode(curNode)
        break
      default:
    }
  }
}

FileTree = connect(
  state => {
    return {FileTreeState: state.FileTreeState}
  }, dispatch => {
    return bindActionCreators(FileTreeActions, dispatch)
  }
)(FileTree)


class FileTreeNode extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {node, ...actionProps} = this.props
    const {openNode, selectNode, onContextMenu} = actionProps
    return (
      <div className='filetree-node-container'
        onContextMenu={e => {selectNode(node); onContextMenu(e, node)} }>
        <div className={cx('filetree-node', {'focus':node.isFocused})}
          ref={r => this.nodeDOM = r}
          onDoubleClick={e => openNode(node)}
          onClick={e => selectNode(node)} >
          <span className='filetree-node-arrow'
            onClick={e => openNode(node, null, e.altKey)} >
            <i className={cx({
              'fa fa-angle-right': node.isFolded,
              'fa fa-angle-down': !node.isFolded,
              'hidden': !node.isDir || node.childrenCount === 0
            })}></i>
          </span>
          <span className='filetree-node-icon'>
            <i className={cx({
              'fa fa-briefcase': node.isRoot,
              'fa fa-folder-o': node.isDir && !node.isRoot,
              'fa fa-file-o': !node.isDir
            })}></i>
          </span>
          <span className='filetree-node-label'>
            {node.name || 'Project'}
          </span>
          <div className='filetree-node-bg'></div>
        </div>

        { node.isDir ?
          <div className={cx('filetree-node-children', {
            isFolded: node.isFolded
          })}>
            {node.children.map( childNode =>
              <FileTreeNode key={childNode.path} node={childNode} {...actionProps} />
            )}
          </div>
          : null }

      </div>
    )
  }

  componentDidUpdate () {
    if (this.props.node.isFocused) {
      this.nodeDOM.scrollIntoViewIfNeeded && this.nodeDOM.scrollIntoViewIfNeeded()
    }
  }
}

export default FileTree
