/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'

class GitStashView extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  
  render () {
    const { branches, updateStashMessage, createStash } = this.props
    const { current: currentBranch} = branches
    const { stashMessage } = this.props.stash
    return (
      <div>
        <div className='git-stash-container'>
          <h1>
          Stash Changes
          </h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-3 control-label">Current Branch</label>
              <label className="col-sm-9 checkbox-inline">
                {currentBranch}
              </label>
            </div>
            <div className="form-group">
              <label htmlFor="inputStashName" className="col-sm-3 control-label">Commit Message</label>
              <div className="col-sm-9">
                <input type="text"
                  className="form-control"
                  id="inputStashName"
                  placeholder="Please input a commit message."
                  onChange={e => {
                    updateStashMessage(e.target.value);
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                />
              </div>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary' onClick={e => createStash(stashMessage)}>OK</button>
          </div>
        </div>
      </div>
    )
  }
}

export default GitStashView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitStashView)
