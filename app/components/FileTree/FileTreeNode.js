import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import * as FileTreeActions from './actions'

class _FileTreeNode extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { node, openNode, selectNode, openContextMenu } = this.props
    if (!node) return null
    return (
      <div id={node.path}
        className="filetree-node-container"
        data-droppable="FILE_TREE_NODE"
        onContextMenu={e => { selectNode(node); openContextMenu(e, node) }}
      >
        <div className={cx('filetree-node', { focus: node.isFocused })}
          ref={r => this.nodeDOM = r}
          onDoubleClick={e => openNode(node)}
          onClick={e => selectNode(node)}
          style={{ paddingLeft: `${1 + node.depth}em` }}
        >
          <span className="filetree-node-arrow"
            onClick={e => openNode(node, null, e.altKey)}
          >
            {node.isDir && <i className={cx({
              'fa fa-angle-right': node.isFolded,
              'fa fa-angle-down': !node.isFolded,
            })}></i>}
          </span>
          <span className="filetree-node-icon">
            <i className={cx({
              'fa fa-briefcase': node.isRoot,
              'fa fa-folder-o': node.isDir && !node.isRoot,
              'fa fa-file-o': !node.isDir
            })}></i>
          </span>
          <span className={
            `filetree-node-label git-${node.gitStatus ? node.gitStatus.toLowerCase() : 'none'}`
          }>
            {node.name || 'Project'}
          </span>
        </div>

        {node.isDir ?
          <div className={cx('filetree-node-children', {
            isFolded: node.isFolded
          })}>
            {node.children.map(childNode =>
              <FileTreeNode key={childNode.path} path={childNode.path} />
            )}
          </div>
          : null}

      </div>
    )
  }

  componentDidUpdate () {
    if (this.props.node.isFocused) {
      this.nodeDOM.scrollIntoViewIfNeeded && this.nodeDOM.scrollIntoViewIfNeeded()
    }
  }
}

const FileTreeNode = connect(
  (state, props) => {
    const node = state.FileTreeState.nodes[props.path]
    return { node: node }
  },
  dispatch => bindActionCreators(FileTreeActions, dispatch)
)(_FileTreeNode)

export default FileTreeNode
