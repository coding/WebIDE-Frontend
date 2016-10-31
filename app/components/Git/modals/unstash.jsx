/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'

class GitUntashView extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.handleDrop = this.handleDrop.bind(this)
    this.handleClear = this.handleClear.bind(this)
    this.handleApply = this.handleApply.bind(this)
    this.handleBranchName = this.handleBranchName.bind(this)
  }

  render () {
    const { branches, unstash, selectStash, dropStash, applyStash,
      updateUnstashIsPop, updateUnstashIsReinstate } = this.props
    const { current: currentBranch} = branches
    var { stashList, selectedStash, isPop, isReinstate, newBranchName } = unstash
    // if (!selectedStash && stashList.length > 0) {
    //   selectedStash = stashList[0]
    // }
    // console.log(selectedStash)
    let confirmBtn = null
    if (newBranchName)
      confirmBtn = 'Branch'
    else
      confirmBtn = 'Apply'
      
    return (
      <div>
        <div className='git-unstash-container'>
          <h1>
          Unstash Changes
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
              <label className="col-sm-3 control-label">Stashes</label>
              <div className="col-sm-7">
                {this.renderStashList(stashList, selectStash, selectedStash)}
              </div>
              <div className="col-lg-2 btn-list">
                {/*<button className='btn btn-default'
                  type='button'
                  onClick={e => console.log('view')}>
                  View
                </button>*/}
                <button className='btn btn-default'
                  type='button'
                  disabled={!selectedStash}
                  onClick={this.handleDrop}>
                  Drop
                </button>
                <button className='btn btn-default'
                  type='button'
                  disabled={stashList.length == 0}
                  onClick={this.handleClear}>
                  Clear
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label"></label>
              <div className="col-sm-9">
                <div className="checkbox">
                  <label>
                    <input type="checkbox"
                      onChange={e => updateUnstashIsPop(e.target.checked)}
                      checked={isPop || newBranchName}
                      disabled={newBranchName}
                     />
                     Pop stash
                  </label>
                </div>
                <div className="checkbox">
                  <label>
                    <input type="checkbox"
                      onChange={e => updateUnstashIsReinstate(e.target.checked)}
                      checked={isReinstate || newBranchName}
                      disabled={newBranchName}
                     />
                     Reinstate index
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">As new branch</label>
              <label className="col-sm-9">
                <input type="text"
                  className="form-control"
                  placeholder="Please input the branch name."
                  onChange={this.handleBranchName}/>
              </label>
            </div>
          </form>
            <hr />
            <div className='modal-ops'>
              <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
              <button className='btn btn-primary' onClick={this.handleApply} disabled={!selectedStash}>{confirmBtn}</button>
            </div>
        </div>
      </div>
    )
  }

  renderStashList(stashList, selectStash, selectedStash) {
    return (
      <div className='stash-list'>
        <ul>
        {
          stashList.map( (item, itemIdx) => {
            return (<li className={cx({isSelected: item.rev == selectedStash.rev})}
              onClick={e=>selectStash(item)}
              key={itemIdx}>
              {`${item.name}:${item.message}`}
            </li>)
          })
        }
        </ul>
      </div>
    )
  }

  handleDrop(e) {
    this.props.dropStash(this.props.unstash.selectedStash.name)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleClear(e) {
    this.props.dropStash(null, true)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleBranchName(e) {
    this.props.updateUnstashBranchName(e.target.value)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleApply(e) {
    if (this.props.unstash.newBranchName) {
      this.props.checkoutStash({
        stashRef: this.props.unstash.selectedStash.name,
        branch: this.props.unstash.newBranchName
      })
    } else {
      this.props.applyStash({
        stashRef: this.props.unstash.selectedStash.name,
        pop: this.props.unstash.isPop,
        applyIndex: this.props.unstash.isReinstate,
      })
    }
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }
}

export default GitUntashView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitUntashView)
