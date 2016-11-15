/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'

import * as GitActions from './actions'

class GitFileTree extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div className='git-filetree-container' tabIndex={1} >
        <GitFileTreeNode path='/' />
      </div>
    )
  }
}


class _GitFileTreeNode extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const {node, statusFiles, ...actionProps} = this.props
    const {toggleNodeFold, selectNode, toggleStaging} = actionProps

    const childrenStagingStatus = this.getChildrenStagingStatus()

    const FILETREE_INDENT = 14

    return (
      <div className='filetree-node-container'>
        { node.isRoot ?
          (<div className='filetree-node' ref={r => this.nodeDOM = r} >
            <span className='filetree-node-checkbox'
              style={{marginRight: 0}}
              onClick={e => toggleStaging(node)} >
              <i className={cx('fa', {
                'fa-check-square': (!node.isDir && node.isStaged) || childrenStagingStatus === 'ALL',
                'fa-square-o': (!node.isDir && !node.isStaged) || childrenStagingStatus === 'NONE',
                'fa-minus-square': childrenStagingStatus === 'SOME',
              })}></i>
            </span>
            <span className='filetree-node-label'>File Status
              ( {this.getStagedLeafNodes().length} staged / {node.leafNodes.length} changed )</span>
          </div>)

        : (<div className={cx('filetree-node', {'focus':node.isFocused})}
            ref={r => this.nodeDOM = r}
            onClick={e => selectNode(node)} >
            <span className='filetree-node-checkbox'
              onClick={e => toggleStaging(node)} >
              <i className={cx('fa', {
                'fa-check-square': (!node.isDir && node.isStaged) || childrenStagingStatus === 'ALL',
                'fa-square-o': (!node.isDir && !node.isStaged) || childrenStagingStatus === 'NONE',
                'fa-minus-square': childrenStagingStatus === 'SOME',
              })}></i>
            </span>
            <span className='filetree-node-arrow'
              onClick={e => toggleNodeFold(node, null, e.altKey)}
              style={{'marginLeft': `${(node.depth-1)*FILETREE_INDENT}px`}} >
              <i className={cx({
                'fa fa-angle-right': node.isFolded,
                'fa fa-angle-down': !node.isFolded,
                'hidden': !node.isDir || node.childrenCount === 0
              })}></i>
            </span>
            <span className='filetree-node-icon'>
              <i className={cx('fa file-status-indicator', node.status.toLowerCase(), {
                'fa-folder-o': node.isDir,
                'fa-pencil-square': node.status == 'MODIFIED',
                'fa-plus-square': node.status == 'UNTRACKED',
                'fa-minus-square': node.status == 'MISSING'
              })}></i>
            </span>
            <span className='filetree-node-label'>
              {node.name || 'Project'}
            </span>
            <div className='filetree-node-bg'></div>
          </div>)
        }

        { node.isDir ?
          <div className={cx('filetree-node-children', {isFolded: node.isFolded})}>
            {node.children.map(childNodePath =>
              <GitFileTreeNode key={childNodePath} path={childNodePath} />
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

  getStagedLeafNodes () {
    const {node, statusFiles} = this.props
    if (!node.isDir) return []
    return node.leafNodes.filter(leafNodePath =>
      statusFiles.get(leafNodePath).get('isStaged')
    )
  }

  getChildrenStagingStatus () {
    const {node, statusFiles} = this.props
    if (!node.isDir) return false
    let stagedLeafNodes = this.getStagedLeafNodes()
    if (stagedLeafNodes.length == 0) {
      return 'NONE'
    } else if (stagedLeafNodes.length === node.leafNodes.length) {
      return 'ALL'
    } else {
      return 'SOME'
    }
  }


}
const GitFileTreeNode = connect(
  (state, ownProps) => ({
    statusFiles: state.GitState.statusFiles,
    node: state.GitState.statusFiles.get(ownProps.path)
  }),
  dispatch => bindActionCreators(GitActions, dispatch)
)(_GitFileTreeNode)

export default GitFileTree
