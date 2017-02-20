/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'

import * as GitActions from './actions'
import GitFileTree from './GitFileTree'

var GitCommitView = ({isWorkingDirClean, ...actionProps}) => {
  const {updateCommitMessage, commit, statusFiles, diffFile} = actionProps
  return isWorkingDirClean ?
    <h1 className=''>Your working directory is clean. Nothing to commit.</h1>
  : (<div>
      <GitFileTree
        statusFiles={statusFiles}
        handleClick={(path) => {
          diffFile({
            path, newRef: 'HEAD', oldRef: '~~unstaged~~'
          })
        }}
      />
      <hr />
      <div className='git-commit-message-container'>
        <textarea name='git-commit-message' id='git-commit-message' rows='4'
          onChange={e => updateCommitMessage(e.target.value)} />
      </div>
      <hr />
      <div className='modal-ops'>
        <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
        <button className='btn btn-primary' onClick={e => commit()}>Commit</button>
      </div>
    </div>
  )
}

export default connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitView)
