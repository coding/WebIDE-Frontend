import React, { Component } from 'react'
import { setSelectionRange } from 'utils'
import { dismissModal } from '../actions'
import i18n from 'utils/createI18n'

class Create extends Component {
  constructor (props) {
    super(props)
    // 1是公开项目，2是私有项目，目前已砍掉公开项目
    this.type = 2;
    this.state = {
      value: props.content.defaultValue || '',
    }
  }

  componentDidMount () {
    if (this.props.content.selectionRange) {
      setSelectionRange(this.input, ...this.props.content.selectionRange)
    }
  }

  render () {
    const { meta, content } = this.props
    return (
      <div className='modal-content'>
        { content.message ?
          <div className='message'>{content.message}</div>
        : null }
        <input type='text'
          className='form-control'
          ref={r => this.input = r}
          onChange={e => this.setState({ value: e.target.value })}
          onKeyDown={this.onKeyDown}
          value={this.state.value}
          placeholder={content.placeholder}
          autoFocus
        />
        { content.statusMessage ?
          <div className='message message-info'>
            <i className='fa fa-info-circle' aria-hidden='true' />
            {content.statusMessage}
          </div>
        : null }
        <div className='footer modal-ops'>
          <button className='btn btn-primary'
            onClick={() => {
              meta.resolve({ projectName: this.state.value, type: this.type })
              dismissModal()
            }}
          >{content.okText || i18n`modal.okButton`}</button>
        </div>
      </div>
    )
  }

  confirm (value) {
    this.props.meta.resolve({ projectName: value, type: this.type })
  }

  cancel = () => {
    this.props.meta.reject()
  }

  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.confirm(e.target.value)
    }
  }
}

export default Create
