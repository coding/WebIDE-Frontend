/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { dispatchCommand } from '../../../commands'
import * as GitActions from '../actions'
import * as ModalActions from '../../Modal/actions'

@connect(state => state.GitState)
class GitNewBranchView extends Component {
  constructor (props) {
    super(props)
    this.state = {newBranch: ''}
  }

  render () {
    const { branches: {current: currentBranch}, dispatch, content } = this.props
    const allBranches = [...this.props.branches.local, ...this.props.branches.remote]
    return (
      <div>
        <div className='git-reset-container'>
          <h1>Create New Branch</h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-3 control-label">Current Branch</label>
              <label className="col-sm-9 checkbox-inline">{currentBranch}</label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">New Branch</label>
              <label className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={this.state.newBranch}
                  onChange={e => this.setState({newBranch: e.target.value})}
                  onKeyDown={e => { if (e.keyCode === 13) {
                    e.preventDefault()
                    this.confirmCreateNewBranch()
                  }}}
                />
                { content && content.statusMessage ?
                  <div className='message'>{content.statusMessage}</div>
                : null }
              </label>
            </div>
          </form>

          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary'
              onClick={this.confirmCreateNewBranch}
              disabled={!this.state.newBranch}>OK</button>
          </div>
        </div>
      </div>
    )
  }

  confirmCreateNewBranch = () => {
    const {branches: {local: localBranches}, dispatch} = this.props
    if (localBranches.includes(this.state.newBranch)) {
      dispatch(ModalActions.updateModal({statusMessage: 'Branch ref already exists. Pick another name.'}))
    } else {
      dispatch(GitActions.newBranch(this.state.newBranch))
    }
  }
}

export default GitNewBranchView
