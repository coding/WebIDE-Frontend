import React, { Component } from 'react'

import { toggleNodeFold, syncAllDirectoryByPath } from 'components/FileTree/actions'
import { syncFile } from 'commons/File/actions'
import FileTreeState from 'components/FileTree/state'
import i18n from 'utils/createI18n'

class FileTreeToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      syncActive: false,
      collapseActive: false,
    };
  }

  syncTree = () => {
    if (this.state.syncActive === true) {
      return;
    }
    this.setState({ syncActive: true });
    this.syncTimer = setTimeout(() => {
      this.setState({ syncActive: false });
    }, 400);
    syncAllDirectoryByPath('');
  }

  foldedAll = () => {
    if (this.state.collapseActive === true) {
      return;
    }
    const { children } = FileTreeState.root;
    if (!children || children.length === 0) {
      return;
    }
    this.setState({ collapseActive: true });
    this.collapseTimer = setTimeout(() => {
      this.setState({ collapseActive: false });
    }, 200);
    children.forEach(child => toggleNodeFold(child, true, true));
  }

  componentWillUnmount() {
    clearTimeout(this.syncTimer);
    clearTimeout(this.collapseTimer);
  }

  render () {
    return (
      <div className='file-tree-tool-container'>
        <i className={`sync fa fa-refresh ${this.state.syncActive ? 'active' : ''}`} title={i18n.get('fileTreeTool.sync')} onClick={this.syncTree}></i>
        <span className={`collapse ${this.state.collapseActive ? 'active' : ''}`} title={i18n.get('fileTreeTool.collapse')} onClick={this.foldedAll}>
          <span className="up"></span>
          <span className="down"></span>
        </span>
      </div>
    )
  }
}

export default FileTreeToolBar;
