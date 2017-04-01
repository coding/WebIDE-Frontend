/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'

class GitRebaseStart extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showTag: false,
      showRemote: false,
      interactive: false,
      preserveMerges: false,
      selectedOnto: '',
      selectedFrom: this.props.branches.current,
    }
    this.handleInteractiveChange = this.handleInteractiveChange.bind(this)
    this.handlePreserveMergesChange = this.handlePreserveMergesChange.bind(this)
    this.handleShowRemoteChagne = this.handleShowRemoteChagne.bind(this)
    this.handleShowTagChange = this.handleShowTagChange.bind(this)
    this.handleLocalBranchChange = this.handleLocalBranchChange.bind(this)
    this.handleOntoChange = this.handleOntoChange.bind(this)
    this.handleConfirm = this.handleConfirm.bind(this)
    this.handleValidate = this.handleValidate.bind(this)
  }
  render () {
    const { branches } = this.props
    return (
      <div>
        <div className='git-rebase-start-container'>
          <h1>
          Rebase branch
          </h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-3 control-label">Branch</label>
              <label className="col-sm-9">
                {this.renderLocalOptions()}
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label"></label>
              <div className="col-sm-9">
                <div className="checkbox">
                  <label>
                    <input type="checkbox"
                      onChange={this.handleInteractiveChange}
                      checked={this.state.interactive}
                     />
                     Interactive
                  </label>
                  
                  <label>
                    <input type="checkbox"
                      onChange={this.handlePreserveMergesChange}
                      checked={this.state.preserveMerges}
                     />
                     Preserve Merges
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">Onto</label>
              <label className="col-sm-7">
                {this.renderOptions()}
              </label>
              <label className="col-sm-2">
                <button className='btn btn-default' onClick={this.handleValidate}>Validate</button>
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label"></label>
              <div className="col-sm-9">
                <div className="checkbox">
                  <label>
                    <input type="checkbox"
                      onChange={this.handleShowTagChange}
                      checked={this.state.showTag}
                     />
                     Show Tags
                  </label>
                  
                  <label>
                    <input type="checkbox"
                      onChange={this.handleShowRemoteChagne}
                      checked={this.state.showRemote}
                     />
                     Show Remote Branches
                  </label>
                </div>
              </div>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary'
              onClick={this.handleConfirm}
              disabled={!this.state.selectedOnto || !this.state.selectedFrom}>
              Rebase
            </button>
          </div>
        </div>
      </div>
    )
  }

  renderLocalOptions () {
    let branches = this.props.branches.local
    return (
      <select
        className='form-control'
        onChange={this.handleLocalBranchChange}
        value={this.state.selectedFrom}
      >
      {
        branches.map((item, i) => {
          let name, value
          if(typeof item === 'string')
            name = value = item
          else
            name = item.name
            value = item.value || name

          return (
            <option key={i}
              value={value}>
              {name}
            </option>
          )
        })
      }
      </select>
    )
  }

  renderOptions () {
    let branches = this.props.branches.local.map((item, i) => {
      return ('refs/heads/' + item)
    })
    if (this.state.showRemote) {
      branches = branches.concat(
        this.props.branches.remote.map((item, i) => {
        return ('refs/remotes/' + item)
      }))
    }
    if (this.state.showTag) {
      branches = branches.concat(
        this.props.tags.map((item, i) => {
        return ('refs/tags/' + item)
      }))
    }
    branches = [''].concat(branches)
    return (
      <select
        className='form-control'
        onChange={this.handleOntoChange}
        value={this.state.selectedOnto}
      >
      {
        branches.map((item, i) => {
          let name, value
          if(typeof item === 'string')
            name = value = item
          else
            name = item.name
            value = item.value || name

          return (
            <option key={i}
              value={value}>
              {name}
            </option>
          )
        })
      }
      </select>
    )
  }

  handleInteractiveChange (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    this.setState({interactive: !this.state.interactive})
  }

  handlePreserveMergesChange (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    this.setState({preserveMerges: !this.state.preserveMerges})
  }

  handleShowRemoteChagne (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    this.setState({showRemote: !this.state.showRemote})
  }

  handleShowTagChange (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    this.setState({showTag: !this.state.showTag})
  }

  handleLocalBranchChange (e) {
    this.setState({selectedFrom: e.target.value})
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleOntoChange (e) {
    this.setState({selectedOnto: e.target.value})
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleConfirm (e) {
    this.props.rebase({
      branch: this.state.selectedFrom,
      upstream: this.state.selectedOnto,
      interactive: this.state.interactive,
      preserve: this.state.preserveMerges,
    })
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleValidate (e) {
    if (this.state.selectedOnto) {
      this.props.gitCommitDiff({
        title: 'View Changes',
        rev: this.state.selectedOnto
      })
    }
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }
}

export default GitRebaseStart = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitRebaseStart)