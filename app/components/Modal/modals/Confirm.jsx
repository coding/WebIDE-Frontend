/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setSelectionRange } from '../../../utils'

class Confirm extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const {meta, content} = this.props
    return (
      <div className='modal-content'>
        { content.header ?
          <div className='header'>{content.header}</div>
        : null }

        { content.message ?
          <div className='message'>{content.message}</div>
        : null }

        { content.statusMessage ?
          <div className='message'>{content.statusMessage}</div>
        : null }

        <div className='footer'>
          <button className='btn btn-primary' onClick={e => meta.resolve(true)}>{content.okText || 'OK'}</button>
          <button className='btn btn-default' onClick={e => meta.resolve(false)}>Cancel</button>
        </div>
      </div>
    )
  }
}

Confirm = connect(
  state => state.ModalState
, null
)(Confirm)

export default Confirm
