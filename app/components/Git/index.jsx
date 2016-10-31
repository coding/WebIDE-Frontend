/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from './actions'
import Menu from '../Menu'

var GitCommitView = ({workingDir, stagingArea, ...actionProps}) => {
  const {isClean, files} = workingDir
  const {updateCommitMessage, updateStagingArea, commit} = actionProps
  if (isClean) return <h1 className=''>Your working directory is clean. Nothing to commit.</h1>
  return (
    <div>
      <div className='git-status-files-container'>
        { files.map(file =>
          <label className='git-status-file' key={file.name}>
            <div className='file-add-checkbox'>
              <input type='checkbox'
                checked={stagingArea.files.indexOf(file.name) != -1}
                onChange={e => updateStagingArea(e.target.checked ? 'stage' : 'unstage', file)} />
            </div>
            <div className={cx('file-status-indicator', file.status.toLowerCase())}>
              <i className={cx('fa', {
                'fa-pencil-square': file.status == 'MODIFIED',
                'fa-plus-square': file.status == 'UNTRACKED',
                'fa-minus-square': file.status == 'MISSING'
              })} /></div>
            <div className='file-path'>{file.name}</div>
          </label>
        ) }
      </div>
      <hr />
      <div className='git-commit-message-container'>
        <textarea name='git-commit-message' id='git-commit-message' rows='4'
          onChange={e => updateCommitMessage(e.target.value)} />
      </div>
      <hr />
      <div className='modal-ops'>
        <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
        <button className='btn btn-primary' onClick={e => commit(stagingArea)}>Commit</button>
      </div>
    </div>
  )
}

export var GitCommitView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitView)

class _GitBranchWidget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isActive: false
    }
  }

  componentWillMount () {
    this.props.getCurrentBranch()
  }

  render () {
    const {current: currentBranch, local: localBranches, remote: remoteBranches} = this.props
    return (
      <div className='status-bar-menu-item' onClick={e => { e.stopPropagation(); this.toggleActive(true, true) }}>
        <span>On branch: {currentBranch}</span>
        { this.state.isActive ?
          <Menu className={cx('bottom-up to-left', {active: this.state.isActive})}
            items={this.makeBrancheMenuItems(localBranches, remoteBranches)}
            deactivate={this.toggleActive.bind(this, false)} />
        : null }
      </div>
    )
  }

  toggleActive (isActive, isTogglingEnabled) {
    if (isTogglingEnabled)
      isActive = !this.state.isActive
    if (isActive) {
      this.props.getBranches()
    }
    this.setState({isActive})
  }

  makeBrancheMenuItems (localBranches, remoteBranches) {
    if (!localBranches && !remoteBranches)
      return [{name: 'Fetching Branches...', isDisabled: true}]

    var localBranchItems = localBranches.map(branch => ({
      name: branch,
      items: [{
        name: 'Checkout',
        command: () => { this.props.checkoutBranch(branch) }
      }]
    }))

    var remoteBranchItems = remoteBranches.map(remoteBranch => {
      var localBranch = remoteBranch.split('/').slice(1).join('/')
      return {
        name: remoteBranch,
        items: [{
          name: 'Checkout to new local branch',
          // @todo: should prompt to input local branch name
          command: () => { this.props.checkoutBranch(localBranch, remoteBranch) }
        }]
      }
    })
    return [
      {name: 'Local Branches', isDisabled: true},
      ...localBranchItems,
      {name: '-', isDisabled: true},
      {name: 'Remote Branches', isDisabled: true},
      ...remoteBranchItems
    ]
  }
}

export var GitBranchWidget = connect(
  state => state.GitState.branches,
  dispatch => bindActionCreators(GitActions, dispatch)
)(_GitBranchWidget)

export default GitCommitView
