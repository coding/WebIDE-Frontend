import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'
import GitFileTree from '../GitFileTree'
import { i18n } from 'utils'


class GitCheckoutStashView extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    const { title, diffFile, showStash } = this.props
    return (
      <div>
        <div className='git-resolve-conflicts'>
          <h1>
            {title || i18n`git.checkoutStashModal.checkoutFailed`}
          </h1>
          <div>{i18n`git.checkoutStashModal.checkoutConfilcts`}</div>
          <GitFileTree
            statusFiles={this.props.statusFiles}
            displayOnly
            hideTitle
            handleClick={(path) => {
              diffFile({
                path, newRef: 'HEAD', oldRef: '~~unstaged~~'
              })
            }}
          />

          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>{i18n`git.cancel`}</button>
            <button className='btn btn-primary' onClick={e => showStash()}>{i18n`git.checkoutStashModal.stashAndCheckout`}</button>
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
