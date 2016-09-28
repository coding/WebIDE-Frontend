/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setSelectionRange } from '../../../utils'

class Prompt extends Component {
  constructor (props) {
    super(props)
    this.state = {value: props.content.defaultValue || ''}
  }

  componentDidMount () {
    setSelectionRange(this.input, ...this.props.content.selectionRange)
  }

  render () {
    const {meta, content} = this.props
    return (
      <div className='modal-content'>
        { content.message ?
          <div className='message'>{content.message}</div>
        : null }
        <input type='text'
          ref={r=>this.input=r}
          onChange={ e=>this.setState({value: e.target.value}) }
          onKeyDown={this.onKeyDown}
          value={this.state.value}
        />
        { content.statusMessage ?
          <div className='message'>{content.statusMessage}</div>
        : null }
      </div>
    )
  }

  confirm (value) {
    this.props.meta.resolve(value)
  }

  cancel = () => {
    this.props.meta.reject()
  }

  dismiss = () => {
    this.props.dispatch({type: 'MODAL_DISMISS'})
  }

  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.confirm(e.target.value)
    }
  }
}


Prompt = connect(
  state => state.ModalState
, null
)(Prompt)

export default Prompt
