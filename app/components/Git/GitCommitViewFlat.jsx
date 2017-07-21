import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'
import i18n from 'utils/createI18n'

import * as GitActions from './actions'

var GitCommitView = ({workingDir, stagingArea, ...actionProps}) => {
  const {isClean, files} = workingDir
  const {updateCommitMessage, updateStagingArea, commit} = actionProps
  if (isClean) return <h1 className=''>{i18n`git.commitView.nothingCommit`}</h1>
  return (
    <div>
      <div className='git-status-files-container'>
        { files.map(file =>
          <label className='git-status-file' key={file.name}>
            <div className='file-add-checkbox'>
              <input type='checkbox'
                checked={stagingArea.files.indexOf(file.name) != -1}
                onChange={e => updateStagingArea(e.target.checked ? 'stage' : 'unstage', file)} />
            </div>
            <div className={cx('file-status-indicator', file.status.toLowerCase())}>
              <i className={cx('fa', {
                'fa-pencil-square': file.status == 'MODIFIED',
                'fa-plus-square': file.status == 'UNTRACKED',
                'fa-minus-square': file.status == 'MISSING'
              })} /></div>
            <div className='file-path'>{file.name}</div>
          </label>
        ) }
      </div>
      <hr />
      <div className='git-commit-message-container'>
        <textarea name='git-commit-message' id='git-commit-message' rows='4'
          onChange={e => updateCommitMessage(e.target.value)} />
      </div>
      <hr />
      <div className='modal-ops'>
        <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>{i18n`git.cancel`}</button>
        <button className='btn btn-primary' onClick={e => commit(stagingArea)}>{i18n`git.commit`}</button>
      </div>
    </div>
  )
}

export default connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitView)
