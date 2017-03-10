import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import * as FileTreeActions from './actions'
import FileTreeNode from './FileTreeNode'
import ContextMenu from '../ContextMenu'
import FileTreeContextMenuItems from './contextMenuItems'
import subscribeToFileChange from './subscribeToFileChange'

const FileUploadInput = ({ node, handleUpload }) => {
  return (
    <form id='filetree-hidden-input-form' style={{position: 'fixed',top: '-10000px'}}>
      <input
        id='filetree-hidden-input'
        type='file'
        name='files'
        multiple={true}
        onChange={e=>handleUpload(e.target.files, node.path)}
      />
    </form>
  )
}

class FileTree extends Component {
  componentDidMount () {
    subscribeToFileChange()
  }

  onKeyDown = (e) => {
    const { focusedNode: curNode, selectNode, openNode } = this.props
    if (e.keyCode === 13 || e.keyCode >= 37 && e.keyCode <= 40) e.preventDefault()
    switch (e.key) {
      case 'ArrowDown':
        selectNode(1)
        break
      case 'ArrowUp':
        selectNode(-1)
        break
      case 'ArrowRight':
        if (!curNode.isDir) break
        if (curNode.isFolded) {
          openNode(curNode, false)
        } else {
          selectNode(1)
        }
        break
      case 'ArrowLeft':
        if (!curNode.isDir || curNode.isFolded) {
          selectNode(curNode.parent)
          break
        }
        if (curNode.isDir) openNode(curNode, true)
        break
      case 'Enter':
        openNode(curNode)
        break
      default:
    }
  }
  render () {
    const { contextMenu, closeContextMenu, uploadFilesToPath } = this.props
    return (
      <div className="filetree-container"
        tabIndex={1}
        onKeyDown={this.onKeyDown}
      >
        <FileTreeNode path='' />
        <ContextMenu
          items={FileTreeContextMenuItems}
          isActive={contextMenu.isActive}
          pos={contextMenu.pos}
          context={contextMenu.contextNode}
          deactivate={closeContextMenu}
        />
        <FileUploadInput node={contextMenu.contextNode}
          handleUpload={uploadFilesToPath}
        />
      </div>
    )
  }
}

FileTree = connect(
  state => {
    const focusedNodes = Object.values(state.FileTreeState.nodes).filter(node => node.isFocused)
    return {
      focusedNode: focusedNodes[0],
      contextMenu: state.FileTreeState.contextMenuState
    }
  },
  dispatch => bindActionCreators(FileTreeActions, dispatch)
)(FileTree)

export default FileTree
