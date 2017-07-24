import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'
import i18n from 'utils/createI18n'

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
    this.handleView = this.handleView.bind(this)
  }

  render () {
    const { branches, unstash, selectStash, dropStash, applyStash,
      updateUnstashIsPop, updateUnstashIsReinstate } = this.props
    const { current: currentBranch } = branches
    const { stashList, selectedStash, isPop, isReinstate, newBranchName } = unstash
    // if (!selectedStash && stashList.length > 0) {
    //   selectedStash = stashList[0]
    // }
    // console.log(selectedStash)
    let confirmBtn = null
    if (newBranchName) { confirmBtn = i18n`git.unStash.branch` } else { confirmBtn = i18n`git.unStash.apply` }

    return (
      <div>
        <div className='git-unstash-container'>
          <h1>
            {i18n`git.unStash.title`}
          </h1>
          <hr />
          <form className='form-horizontal'>
            <div className='form-group'>
              <label className='col-sm-3 control-label'>{i18n`git.unStash.currentBranch`}</label>
              <label className='col-sm-9 checkbox-inline'>
                {currentBranch}
              </label>
            </div>
            <div className='form-group'>
              <label className='col-sm-3 control-label'>{i18n`git.unStash.stashes`}</label>
              <div className='col-sm-7'>
                {this.renderStashList(stashList, selectStash, selectedStash)}
              </div>
              <div className='col-lg-2 btn-list'>
                <button className='btn btn-default'
                  type='button'
                  onClick={this.handleView}
                >
                  {i18n`git.unStash.view`}
                </button>
                <button className='btn btn-default'
                  type='button'
                  disabled={!selectedStash}
                  onClick={this.handleDrop}
                >
                  {i18n`git.unStash.drop`}
                </button>
                <button className='btn btn-default'
                  type='button'
                  disabled={stashList.length == 0}
                  onClick={this.handleClear}
                >
                  {i18n`git.unStash.clear`}
                </button>
              </div>
            </div>
            <div className='form-group'>
              <label className='col-sm-3 control-label' />
              <div className='col-sm-9'>
                <div className='checkbox'>
                  <label>
                    <input type='checkbox'
                      onChange={e => updateUnstashIsPop(e.target.checked)}
                      checked={isPop || newBranchName}
                      disabled={newBranchName}
                    />
                    {i18n`git.unStash.popStash`}
                  </label>
                </div>
                <div className='checkbox'>
                  <label>
                    <input type='checkbox'
                      onChange={e => updateUnstashIsReinstate(e.target.checked)}
                      checked={isReinstate || newBranchName}
                      disabled={newBranchName}
                    />
                    {i18n`git.unStash.reinstateIndex`}
                  </label>
                </div>
              </div>
            </div>
            <div className='form-group'>
              <label className='col-sm-3 control-label'>
                {i18n`git.unStash.asNewBranch`}

              </label>
              <label className='col-sm-9'>
                <input type='text'
                  className='form-control'
                  placeholder={i18n.get('git.unStash.placeholder')}
                  onChange={this.handleBranchName}
                />
              </label>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>
              {i18n`git.cancel`}

            </button>
            <button className='btn btn-primary' onClick={this.handleApply} disabled={!selectedStash}>{confirmBtn}</button>
          </div>
        </div>
      </div>
    )
  }

  renderStashList (stashList, selectStash, selectedStash) {
    return (
      <div className='stash-list'>
        <ul>
          {
          stashList.map((item, itemIdx) => (<li className={cx({ isSelected: item.rev == selectedStash.rev })}
            onClick={e => selectStash(item)}
            key={itemIdx}
          >
            {`${item.name}:${item.message}`}
          </li>))
        }
        </ul>
      </div>
    )
  }

  handleView (e) {
    const commit = this.props.unstash.selectedStash.rev
    // let oldRef = commit + '^'
    this.props.gitCommitDiff({
      title: 'View Changes',
      rev: commit
    })
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleDrop (e) {
    this.props.dropStash(this.props.unstash.selectedStash.name)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleClear (e) {
    this.props.dropStash(null, true)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleBranchName (e) {
    this.props.updateUnstashBranchName(e.target.value)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  handleApply (e) {
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
