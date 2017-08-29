import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'
import i18n from 'utils/createI18n'


import * as GitActions from './actions'
import GitFileTree from './GitFileTree'

var GitCommitView = ({isWorkingDirClean, ...actionProps}) => {
  const {updateCommitMessage, commit, statusFiles, diffFile} = actionProps
  const initialCommitMessage = i18n.get('git.commitView.initMessage')
  return isWorkingDirClean ?
    <h1 className=''>{i18n`git.commitView.nothingCommit`}</h1>
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
          placeholder={initialCommitMessage}
          onChange={e => updateCommitMessage(e.target.value)}
          onKeyDown={e => {if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) commit()}}
        />
      </div>
      <hr />
      <div className='modal-ops'>
        <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>{i18n`git.cancel`}</button>
        <button className='btn btn-primary' onClick={e => commit()}>{i18n`git.commit`}</button>
      </div>
    </div>
  )
}

export default connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitView)
