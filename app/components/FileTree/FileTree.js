import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TreeNode as FileTreeNode } from 'commons/Tree'
import subscribeToFileChange from 'commons/File/subscribeToFileChange'
import * as FileTreeActions from './actions'
import FileTreeState from './state'

const FileUploadInput = ({ node, handleUpload }) => {
  return (
    <form id='filetree-hidden-input-form' style={{position: 'fixed',top: '-10000px'}}>
      <input
        id='filetree-hidden-input'
        type='file'
        name='files'
        multiple
        onChange={e => handleUpload(e.target.files, node.path)}
      />
    </form>
  )
}

@observer
class FileTree extends Component {
  componentDidMount () {
    subscribeToFileChange()
  }

  onKeyDown = (e) => {
    const curNode = FileTreeState.focusedNodes[0]
    const { selectNode, openNode } = FileTreeActions
    if (e.keyCode === 13 || (e.keyCode >= 37 && e.keyCode <= 40)) e.preventDefault()
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
    const { uploadFilesToPath, selectNode, openNode, openContextMenu } = FileTreeActions
    const rootNode = FileTreeState.root

    return (
      <div className='filetree-container'
        tabIndex={1}
        onKeyDown={this.onKeyDown}
      >
        <FileTreeNode node={rootNode}
          selectNode={selectNode}
          openNode={openNode}
          openContextMenu={openContextMenu}
        />
        <FileUploadInput
          handleUpload={uploadFilesToPath}
        />
      </div>
    )
  }
}

export default FileTree
