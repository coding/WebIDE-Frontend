import React, { Component } from 'react'
import { camelCase } from 'lodash'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { observer } from 'mobx-react'
import config from 'config'
import cx from 'classnames'
import dnd from 'utils/dnd'
import icons from 'file-icons-js'
import { fileIconProviders } from 'components/FileTree/state'

@observer
class TreeNode extends Component {
  componentDidUpdate () {
    if (this.props.node.isFocused && this.nodeDOM) {
      this.nodeDOM.scrollIntoViewIfNeeded && this.nodeDOM.scrollIntoViewIfNeeded()
    }
  }

  resolveFolderIcon = (defaultIconStr) => {
    const { node } = this.props
    const provider = fileIconProviders.get(config.fileicons)
    const fileIconsProvider = typeof provider === 'function' ? provider() : provider
    if (fileIconsProvider && fileIconsProvider.foldericons) {
      const { icons: allicons, foldericons: foldericonsMap } = fileIconsProvider
      if (!foldericonsMap.icons || foldericonsMap.icons.length === 0) {
        return (<span
          className='filetree-node-icon'
          style={{
            backgroundImage: `url(${allicons[foldericonsMap.defaultIcon]})`,
            width: 15,
            height: 15
          }}
        />)
      }
      let folderName = foldericonsMap.defaultIcon
      for (let i = 0; i < foldericonsMap.icons.length; i += 1) {
        const foldericon = foldericonsMap.icons[i]
        if (foldericon.folderNames.includes(node.name)) {
          folderName = foldericon.name
          break
        }
      }
      const finalyFolderName = !!node.isFolded
          ? allicons[folderName] ? folderName : foldericonsMap.defaultIcon
          : allicons[`${folderName}-open`] ? `${folderName}-open` : `${foldericonsMap.defaultIcon}-open`
      return (
        <span
          className='filetree-node-icon'
          style={{
            backgroundImage: `url(${allicons[finalyFolderName]})`,
            width: 15,
            height: 15
          }}
        />
      )
    }
    return (
      <span className='filetree-node-icon'>
        <i className={defaultIconStr} />
      </span>
    )
  }

  resolveFileIcon = (defaultIconStr) => {
    const { node } = this.props
    const provider = fileIconProviders.get(config.fileicons)
    const fileIconsProvider = typeof provider === 'function' ? provider() : provider
    if (fileIconsProvider && fileIconsProvider.fileicons) {
      const { icons: allicons, fileicons: fileiconsMap } = fileIconsProvider
      if (!fileiconsMap.icons || fileiconsMap.icons.length === 0) {
        return (<span
          className='filetree-node-icon'
          style={{
            backgroundImage: `url(${allicons[fileiconsMap.defaultIcon]})`,
            width: 15,
            height: 15
          }}
        />)
      }
      let fileiconName = fileiconsMap.defaultIcon
      const extension = node.name.split('.').pop()
      for (let i = 0; i < fileiconsMap.icons.length; i += 1) {
        const fileicon = fileiconsMap.icons[i]
        if ((fileicon.fileNames && fileicon.fileNames.includes(node.name)) || (fileicon.fileExtensions && fileicon.fileExtensions.includes(extension))) {
          fileiconName = fileicon.name
          break
        }
      }
      return (
        <span
          className='filetree-node-icon'
          style={{
            backgroundImage: `url(${allicons[fileiconName] || allicons[fileiconsMap.defaultIcon]})`,
            width: 15,
            height: 15
          }}
        />
      )
    }
    return (
      <span className='filetree-node-icon'>
        <i className={defaultIconStr} />
      </span>
    )
  }

  render () {
    const { node, openNode, selectNode, openContextMenu, onlyDir } = this.props
    if (!node || node.parentId === undefined) return null
    if (onlyDir && !node.isDir) return null
    // const fileIconProvider = fileIconProviders.get('material-file-icon')() || null
    const isDefaultIcon = config.fileicons === 'default'
    let iconStr = ''
    if (!node.isDir) {
      iconStr = icons.getClassWithColor(node.name) || 'fa fa-file-text-o'
    } else if (node.isFolded) {
      iconStr = 'fa fa-folder-o'
    } else if (!node.isFolded) {
      iconStr = 'fa fa-folder-open-o'
    }
    // if (node.isRoot) {
    //   iconStr = 'fa fa-briefcase'
    // } else if (node.isDir && !node.isRoot && node.isFolded) {
    //   iconStr = 'fa fa-folder-o'
    // } else if (node.isDir && !node.isRoot && !node.isFolded) {
    //   iconStr = 'fa fa-folder-open-o'
    // } else if (!node.isDir) {
    //   iconStr = icons.getClassWithColor(node.name) || 'fa fa-file-text-o'
    // }
    return (
      <div
        id={node.id}
        className={cx('filetree-node-container', {
          highlight: node.isHighlighted
        })}
        data-droppable='FILE_TREE_NODE'
        onContextMenu={(e) => {
          selectNode(node)
          openContextMenu(e, node)
        }}
        draggable='true'
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/html', e.target.innerHTML)
          e.stopPropagation()
          if (node.id) {
            dnd.dragStart({ type: 'FILE_TREE_NODE', id: node.id, node })
          }
        }}
      >
        <div
          className={cx('filetree-node', { focus: node.isFocused })}
          ref={r => (this.nodeDOM = r)}
          onClick={e => selectNode(node)}
          onDoubleClick={e => openNode(node)}
          onTouchStart={e => openNode(node)}
          style={{ paddingLeft: `${1 + node.depth}em` }}
        >
          {node.isLoading && <i className='fa fa-spinner fa-pulse fa-fw' />}
          {!node.isLoading && (
            <span
              className='filetree-node-arrow'
              onDoubleClick={e => e.stopPropagation()}
              onClick={e => openNode(node, null, e.altKey)}
            >
              {node.isDir && (
                <i
                  className={cx({
                    'fa fa-caret-right': node.isFolded,
                    'fa fa-caret-down': !node.isFolded
                  })}
                />
              )}
            </span>
          )}
          {isDefaultIcon ? (
            <span className='filetree-node-icon'>{<i className={iconStr} />}</span>
          ) : node.isDir ? (
            this.resolveFolderIcon(iconStr)
          ) : (
            this.resolveFileIcon(iconStr)
          )}
          <span
            className={`filetree-node-label git-${
              node.gitStatus ? node.gitStatus.toLowerCase() : 'none'
            }`}
          >
            {node.name || config.projectName}
          </span>
        </div>
        {node.isDir && (
          <div className={cx('filetree-node-children', {})}>
            <ReactCSSTransitionGroup
              transitionName='filetree'
              transitionEnterTimeout={500}
              transitionLeaveTimeout={300}
            >
              {!node.isFolded &&
                node.children.length > 0 && (
                  <div>
                    {node.children.map(childNode => (
                      <TreeNode
                        key={childNode.id}
                        node={childNode}
                        openNode={openNode}
                        selectNode={selectNode}
                        openContextMenu={openContextMenu}
                        onlyDir={onlyDir}
                      />
                    ))}
                  </div>
                )}
            </ReactCSSTransitionGroup>
          </div>
        )}
      </div>
    )
  }
}

export default TreeNode
