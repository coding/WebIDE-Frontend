/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'

import * as GitActions from './actions'

const Node = ({nodeName, children}) => {
  return (
    <div className='git-status-node'>
      <label className='git-status-file'>
        <div className='file-add-checkbox'>
          <input type='checkbox' />
        </div>
        <div className='file-path'>{nodeName}</div>
      </label>
      <div className='children-nodes' style={{paddingLeft: '20px'}}>
        { _.map(children, (node, _nodeName) => (
          !node.$$isLeaf
          ? (<Node nodeName={_nodeName} children={node} key={_nodeName} />)
          : (<label className='git-status-file' key={node.name}>
              <div className='file-add-checkbox'>
                <input type='checkbox'
                  // checked={stagingArea.files.indexOf(node.name) != -1}
                  onChange={e => updateStagingArea(e.target.checked ? 'stage' : 'unstage', node)} />
              </div>
              <div className={cx('file-status-indicator', node.status.toLowerCase())}>
                <i className={cx('fa', {
                  'fa-pencil-square': node.status == 'MODIFIED',
                  'fa-plus-square': node.status == 'UNTRACKED',
                  'fa-minus-square': node.status == 'MISSING'
                })} /></div>
              <div className='file-path'>{_nodeName}</div>
            </label>)
          )
        )}
      </div>
    </div>
  )
}

var GitCommitView = ({workingDir, stagingArea, ...actionProps}) => {
  const {isClean, files} = workingDir
  const {updateCommitMessage, updateStagingArea, commit} = actionProps
  if (isClean) return <h1 className=''>Your working directory is clean. Nothing to commit.</h1>

  let filesAsTree = files.reduce((rootNodeOfTree, file) => {
    let pathComps = file.name.split('/')
    pathComps.reduce((node, pathComp, idx) => {
      if (!node[pathComp]) node[pathComp] = {}
      if (idx === pathComps.length - 1) {
        node[pathComp] = file
        node[pathComp].$$isLeaf = true
      }
      return node[pathComp]
    }, rootNodeOfTree)
    return rootNodeOfTree
  }, {})

  return (
    <div>
      <div className='git-status-files-container'>
        <Node nodeName='root' children={filesAsTree} />
      </div>
      <hr />
      <div className='git-commit-message-container'>
        <textarea name='git-commit-message' id='git-commit-message' rows='4'
          onChange={e => updateCommitMessage(e.target.value)} />
      </div>
      <hr />
      <div className='modal-ops'>
        <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
        <button className='btn btn-primary' onClick={e => commit(stagingArea)}>Commit</button>
      </div>
    </div>
  )
}

export default connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitView)
