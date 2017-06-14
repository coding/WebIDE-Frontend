import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'
import GitFileTree from '../GitFileTree'

class GitCheckoutStashView extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    console.log(this.props)
    const {title, diffFile, showStash} = this.props
    return (
      <div>
        <div className='git-resolve-conflicts'>
          <h1>
          {title || 'Checkout failed'}
          </h1>
          <div>Checkout has not completed because of checkout conflicts, do you want to stash first?</div>
          <GitFileTree
            statusFiles={this.props.statusFiles}
            displayOnly={true}
            hideTitle={true}
            handleClick={(path) => {
              diffFile({
                path, newRef: 'HEAD', oldRef: '~~unstaged~~'
              })
            }}
          />
          
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary' onClick={e => showStash()}>Stash and Checkout</button>
          </div>
        </div>
      </div>
    )
  }
}

export default GitCheckoutStashView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCheckoutStashView)