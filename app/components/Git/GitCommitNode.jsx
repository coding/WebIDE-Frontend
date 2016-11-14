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
      <div className='filetree-container' tabIndex={1} >
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
    const {node, ...actionProps} = this.props
    const {toggleNodeFold, selectNode} = actionProps
    return (
      <div className='filetree-node-container'>
        <div className={cx('filetree-node', {'focus':node.isFocused})}
          ref={r => this.nodeDOM = r}
          onClick={e => selectNode(node)} >
          <span className='filetree-node-arrow'
            onClick={e => toggleNodeFold(node, null, e.altKey)} >
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
}
const GitFileTreeNode = connect(
  (state, ownProps) => ({node: state.GitState.statusFiles.get(ownProps.path)}),
  dispatch => bindActionCreators(GitActions, dispatch)
)(_GitFileTreeNode)

export default GitFileTree
