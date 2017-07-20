import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from './actions'
import Menu from '../Menu'

// add withRef to deliver ref to the wrapperedcomponent
@connect(state => state.GitState.branches,
  dispatch => bindActionCreators(GitActions, dispatch), null, { withRef: true })
export default class GitBranchWidget extends Component {
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
    const { current: currentBranch, local: localBranches, remote: remoteBranches } = this.props
    return (
      <div className='status-bar-menu-item'
        onClick={e => { e.stopPropagation(); this.toggleActive(true, true) }}
      >
        <span>
          <span className='fa fa-code-fork' style={{ fontWeight: 800, marginRight: '5px' }} />
          {currentBranch}
        </span>
        {this.state.isActive ?
          <div className='git-branch-widget'>
            <div className='widget-header'>
              <h2>Git Branches</h2>
            </div>
            <Menu className={cx('bottom-up to-left', { active: this.state.isActive })}
              style={{
                position: 'relative',
                border: 0,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              }}
              items={this.makeBrancheMenuItems(localBranches, remoteBranches)}
              deactivate={this.toggleActive.bind(this, false)}
            />
          </div>
        : null}
      </div>
    )
  }

  toggleActive (isActive, isTogglingEnabled) {
    if (isTogglingEnabled) { isActive = !this.state.isActive }
    if (isActive) {
      this.props.getBranches()
    }
    this.setState({ isActive })
  }

  makeBrancheMenuItems (localBranches, remoteBranches) {
    if (!localBranches && !remoteBranches) {
      return [{ name: 'Fetching Branches...', isDisabled: true }]
    }

    const localBranchItems = localBranches.map(branch => ({
      name: branch,
      items: [{
        name: 'Checkout',
        command: () => { this.props.checkoutBranch(branch) }
      }, {
        name: 'Checkout as new branch',
        command: () => dispatchCommand('git:checkout_new_branch', {
          fromBranch: branch
        })
      }, {
        name: 'Delete',
        command: () => { this.props.gitDeleteBranch(branch) }
      }]
    }))

    const remoteBranchItems = remoteBranches.map(remoteBranch => {
      const localBranch = remoteBranch.split('/').slice(1).join('/')
      return {
        name: remoteBranch,
        items: [{
          name: 'Checkout as new branch',
          // @todo: should prompt to input local branch name
          command: () => dispatchCommand('git:checkout_new_branch', {
            fromBranch: remoteBranch,
            toBranch: localBranch
          })
        }, {
          name: 'Delete',
          command: () => { this.props.gitDeleteBranch(remoteBranch) }
        }]
      }
    })
    return [
      { name: 'New Branch', command: () => dispatchCommand('git:new_branch'),
        iconElement: (<span style={{ marginRight: '0.3em' }}>+</span>) },
      { name: 'Synchronize', command: () => this.props.getFetch() },
      { isDivider: true },
      { name: 'Local Branches', isDisabled: true },
      ...localBranchItems,
      { isDivider: true },
      { name: 'Remote Branches', isDisabled: true },
      ...remoteBranchItems
    ]
  }
}
