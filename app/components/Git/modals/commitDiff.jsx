import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'
import i18n from 'utils/createI18n'


import * as GitActions from '../actions'
import GitFileTree from '../GitFileTree'

class GitCommitDiffView extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.handleFileClick = this.handleFileClick.bind(this)
  }

  render () {
    const {title, ref} = this.props.commitDiff
    return (
      <div>
        <div className='git-resolve-conflicts'>
          <h1>
          {title}
          </h1>
          <GitFileTree
            statusFiles={this.props.commitDiff.filesMap}
            displayOnly={true}
            hideTitle={true}
            handleClick={(path) => {
              this.handleFileClick(path)
          }} />

          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>{i18n`git.cancel`}</button>
          </div>
        </div>
      </div>
    )
  }

  handleFileClick (path) {
    const {oldRef, ref} = this.props.commitDiff
    if (oldRef) {
      this.props.diffFile({
        path, newRef: ref, oldRef
      })
    } else {
      this.props.diffFile({
        path, newRef: ref, oldRef: '~~unstaged~~'
      })
    }
  }
}

export default GitCommitDiffView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitDiffView)