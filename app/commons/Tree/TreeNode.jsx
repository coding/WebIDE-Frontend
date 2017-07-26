import React, { Component } from 'react'
import { observer } from 'mobx-react'
import config from 'config'
import cx from 'classnames'

@observer
class TreeNode extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { node, openNode, selectNode, openContextMenu } = this.props
    if (!node) return null
    return (
      <div id={node.id}
        className={cx('filetree-node-container', {
          highlight: node.isHighlighted
        })}
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
            onClick={e => openNode(node, null, e.altKey)}>
            {node.isDir && <i className={cx({
              'fa fa-angle-right': node.isFolded,
              'fa fa-angle-down': !node.isFolded,
            })}></i>}
          </span>
          <span className="filetree-node-icon">
            <i className={cx({
              'fa fa-briefcase': node.isRoot,
              'fa fa-folder-o': node.isDir && !node.isRoot && node.isFolded,
              'fa fa-folder-open-o': node.isDir && !node.isRoot && !node.isFolded,
              'fa fa-file-o': !node.isDir
            })}></i>
          </span>
          <span className={`filetree-node-label git-${node.gitStatus ? node.gitStatus.toLowerCase() : 'none'}`}>
            {node.name || config.projectName}
          </span>
        </div>
        {node.isDir &&
        <div className={cx('filetree-node-children', {
          isFolded: node.isFolded
        })}>
          {node.children.map(childNode =>
            <TreeNode key={childNode.id}
              node={childNode}
              openNode={openNode}
              selectNode={selectNode}
              openContextMenu={openContextMenu}
            />
          )}
        </div>}
      </div>
    )
  }

  componentDidUpdate () {
    if (this.props.node.isFocused) {
      this.nodeDOM.scrollIntoViewIfNeeded && this.nodeDOM.scrollIntoViewIfNeeded()
    }
  }
}

export default TreeNode
