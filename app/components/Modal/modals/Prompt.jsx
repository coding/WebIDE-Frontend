import React, { Component } from 'react'
import { setSelectionRange } from 'utils'
import { dismissModal } from '../actions'

class Prompt extends Component {
  constructor (props) {
    super(props)
    this.state = { value: props.content.defaultValue || '' }
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
          className='form-control'
          ref={r=> this.input =r}
          onChange={e => this.setState({ value: e.target.value })}
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

  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.confirm(e.target.value)
    }
  }
}

export default Prompt
