/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { dispatchCommand } from '../../../commands'
import * as GitActions from '../actions'

@connect(state => state.GitState)
class GitTagView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tagName: '',
      commit: 'HEAD',
      message: ''
    }
  }

  render () {
    const { branches: {current: currentBranch}, dispatch } = this.props
    return (
      <div>
        <div className='git-reset-container'>
          <h1>Tag</h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-3 control-label">Current Branch</label>
              <label className="col-sm-9 checkbox-inline">{currentBranch}</label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">Tag Name</label>
              <label className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={this.state.tagName}
                  onChange={e => this.setState({tagName: e.target.value})} />
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">Commit</label>
              <label className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={this.state.commit}
                  onChange={e => this.setState({commit: e.target.value})} />
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">Message</label>
              <label className="col-sm-9">
                <textarea type="text"
                  className="form-control"
                  value={this.state.message}
                  onChange={e => this.setState({message: e.target.value})} />
              </label>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary'
              onClick={e => dispatch(GitActions.addTag({
                tagName: this.state.tagName,
                ref: this.state.commit,
                message: this.state.message,
              }))}
              disabled={!this.state.commit}>OK</button>
          </div>
        </div>
      </div>
    )
  }
}

export default GitTagView
