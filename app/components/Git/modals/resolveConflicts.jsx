/* @flow weak */
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'

class GitResolveConflictsView extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
    // this.handleFileClick = this.handleFileClick.bind(this)
  }

  render () {
    const conflictsFiles = _.filter(this.props.workingDir.files, (file) => {
      return file.status === 'CONFLICTION'
    })
    return (
      <div>
        <div className='git-resolve-conflicts'>
          <h1>
          Conflicts List
          </h1>
          <hr />
          {
            conflictsFiles.map((file) =>
              <label
                className='git-status-file'
                key={file.name}
                onClick={this.handleFileClick.bind(this, file)}
              >
                <div className={cx('file-status-indicator', file.status.toLowerCase())}>
                <i className={cx('fa', {
                  'fa-pencil-square': file.status == 'MODIFIED',
                  'fa-plus-square': file.status == 'UNTRACKED',
                  'fa-minus-square': file.status == 'MISSING',
                  'fa-question-circle-o': file.status == 'CONFLICTION',
                })} /></div>
                <div className='file-path'>{file.name}</div>
              </label>
            )
          }
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  handleFileClick (file) {
    console.log('handleFileClick')
    console.log(file)
    this.props.mergeFile(file)
  }
}

export default GitResolveConflictsView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitResolveConflictsView)