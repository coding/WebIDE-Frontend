/* @flow weak */
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'
import GitFileTree from '../GitFileTree'

class GitResolveConflictsView extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.content && nextProps.content.isInvalid) {
      this.props.gitGetStatus('CONFLICTION')
    }
  }

  render () {
    return (
      <div>
        <div className='git-resolve-conflicts'>
          <h1>
          Conflicts List
          </h1>
          <GitFileTree
            statusFiles={this.props.statusFiles}
            displayOnly={true}
            hideTitle={true}
            handleClick={(path) => {
              this.handleFileClick(path)
          }} />
          
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  handleFileClick (path) {
    this.props.mergeFile(_.trimStart(path, '/'))
  }
}

export default GitResolveConflictsView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitResolveConflictsView)