/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { dispatchCommand } from '../../../commands'
import * as GitActions from '../actions'

@connect(state => state.GitState)
class GitMergeView extends Component {
  constructor (props) {
    super(props)
    this.state = { branchToMerge: '' }
  }

  render () {
    const { branches: { current: currentBranch }, dispatch } = this.props
    const allBranches = [
      ...this.props.branches.local.filter(branch => branch !== currentBranch),
      ...this.props.branches.remote]
    return (
      <div>
        <div className='git-reset-container'>
          <h1>Merge Branch</h1>
          <hr />
          <form className='form-horizontal'>
            <div className='form-group'>
              <label className='col-sm-3 control-label'>Current Branch</label>
              <label className='col-sm-9 checkbox-inline'>{currentBranch}</label>
            </div>
            <div className='form-group'>
              <label className='col-sm-3 control-label'>Branch to merge</label>
              <label className='col-sm-3'>
                <select className='form-control'
                  onChange={e => this.setState({ branchToMerge: e.target.value })}
                  value={this.state.branchToMerge}
                >
                  <option disabled selected value> -- select an branch -- </option>
                  {allBranches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                </select>
              </label>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary'
              onClick={e => dispatch(GitActions.mergeBranch(this.state.branchToMerge))}
              disabled={!this.state.branchToMerge}
            >OK</button>
          </div>
        </div>
      </div>
    )
  }
}

export default GitMergeView
