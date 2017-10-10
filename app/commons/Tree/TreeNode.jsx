import React, { Component } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { observer } from 'mobx-react'
import config from 'config'
import cx from 'classnames'
import dnd from 'utils/dnd'
import icons from 'file-icons-js'

@observer
class TreeNode extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { node, openNode, selectNode, openContextMenu, onlyDir } = this.props
    if (!node) return null
    if (onlyDir && !node.isDir) return null
    let iconStr = ''
    if (node.isRoot) {
      iconStr = 'fa fa-briefcase'
    } else if (node.isDir && !node.isRoot && node.isFolded) {
      iconStr = 'fa fa-folder-o'
    } else if (node.isDir && !node.isRoot && !node.isFolded) {
      iconStr = 'fa fa-folder-open-o'
    } else if (!node.isDir) {
      iconStr = icons.getClassWithColor(node.name)
    }
    return (
      <div id={node.id}
        className={cx('filetree-node-container', {
          highlight: node.isHighlighted
        })}
        data-droppable="FILE_TREE_NODE"
        onContextMenu={e => {
          selectNode(node)
          openContextMenu(e, node)
        }}
        draggable='true'
        onDragStart={e => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/html', e.target.innerHTML)
          e.stopPropagation()
          if (node.id) {
            dnd.dragStart({ type: 'FILE_TREE_NODE', id: node.id, node })
          }
        }}
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
            <i className={iconStr}></i>
          </span>
          <span className={`filetree-node-label git-${node.gitStatus ? node.gitStatus.toLowerCase() : 'none'}`}>
            {node.name || config.projectName}
          </span>
        </div>
        {node.isDir &&
        <div className={cx('filetree-node-children', {
        })}>
          <ReactCSSTransitionGroup
            transitionName='filetree'
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {!node.isFolded && node.children.map(childNode =>
              <TreeNode key={childNode.id}
                node={childNode}
                openNode={openNode}
                selectNode={selectNode}
                openContextMenu={openContextMenu}
                onlyDir={onlyDir}
              />
            )}
          </ReactCSSTransitionGroup>
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
