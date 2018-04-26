import React, { Component } from 'react'

import { toggleNodeFold, initializeFileTree } from 'components/FileTree/actions'
import FileTreeState from 'components/FileTree/state'
import i18n from 'utils/createI18n'

class FileTreeToolBar extends Component {
  foldedAll = () => {
    const rootNode = FileTreeState.root
    const { children } = rootNode

    if (!children || children.length === 0) {
      return
    }

    children.forEach(child => toggleNodeFold(child, true, true))
  }

  fetchPathByRoot = () => {
    initializeFileTree()
  }

  render () {
    return (
      <div className='file-tree-tool-container'>
        <i
          className='icon fa fa-refresh'
          title={i18n.get('fileTreeTool.tools.sync')}
          onClick={this.fetchPathByRoot}
        />
        <i
          className='icon fa fa-window-restore'
          title={i18n.get('fileTreeTool.tools.collapse')}
          onClick={this.foldedAll}
        />
      </div>
    )
  }
}

export default FileTreeToolBar
