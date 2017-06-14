import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'

class GitRebaseInput extends Component {
  constructor (props) {
    super(props)
    this.state = {
      message: this.props.content
    }
    this.updateMessage = this.updateMessage.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
  }
  render () {
    return (
      <div>
        <div className='git-rebase-input-container'>
          <h1>
          Additional Rebase Input
          </h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <div className="col-sm-12">
                <textarea name='git-commit-message' id='git-commit-message' rows='12'
          onChange={e => this.updateMessage(e.target.value)} value={this.state.message} />
              </div>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary'
              onClick={this.handleConfirm}
            >
              Resume Rebasing
            </button>
          </div>
        </div>
      </div>
    )
  }

  updateMessage (value) {
    this.setState({message: value})
  }

  handleConfirm () {
    dispatchCommand('modal:dismiss')
    this.props.gitRebaseOperate({
      operation: 'CONTINUE',
      message: this.state.message,
    })
  }
}

export default GitRebaseInput = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitRebaseInput)