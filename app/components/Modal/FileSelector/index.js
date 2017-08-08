import React, { Component } from 'react'
import { connect } from 'react-redux'
import { observable, computed, action } from 'mobx'
import { observer } from 'mobx-react'
import { setSelectionRange } from '../../../utils'
import { dispatchCommand } from '../../../commands'
import { TreeNode as FileTreeNode } from 'commons/Tree'
import FileTreeState from '../../FileTree/state'
import * as FileTreeActions from '../../FileTree/actions'

@observer
class FileSelector extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const {meta, content} = this.props
    const { title, onlyDir } = content
    const { selectNode, openNode } = FileTreeActions
    const rootNode = FileTreeState.root
    // const curNode = FileTreeState.focusedNodes[0]
    return (
      <div className='modal-content'>
        <div className='header'>{title}</div>
        <div className='filetree-container'
          tabIndex={1}
          onKeyDown={this.onKeyDown}
        >
          <FileTreeNode node={rootNode}
            selectNode={selectNode}
            openNode={openNode}
            onlyDir={onlyDir}
          />
        </div>

        <div className='footer modal-ops'>
          <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
          <button className='btn btn-primary' onClick={e => meta.resolve(FileTreeState.focusedNodes[0])} disabled={!FileTreeState.focusedNodes[0]}>OK</button>        
        </div>
      </div>
    )
  }
}

export default FileSelector
