import React, { Component } from 'react'
import { setSelectionRange } from 'utils'
import { dismissModal } from '../actions'
import i18n from 'utils/createI18n'

class Create extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.content.defaultValue || '',
      type: 1,
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
        <div className='modal-radio' onChange={e => this.setState({
          type: e.target.value
        })}>
          <input type='radio' name='project' value='1' defaultChecked />{i18n`global.projectPublic`}
          <input type='radio' name='project' value='2' />{i18n`global.projectPrivate`}
        </div>
        { content.statusMessage ?
          <div className='message message-info'>
            <i className='fa fa-info-circle' aria-hidden='true' />
            {content.statusMessage}
          </div>
        : null }
        <div className='footer modal-ops'>
          <button className='btn btn-primary'
            onClick={() => {
              meta.resolve({ projectName: this.state.value, type: this.state.type })
              dismissModal()
            }}
          >{content.okText || i18n`modal.okButton`}</button>
        </div>
      </div>
    )
  }

  confirm (value) {
    this.props.meta.resolve({ projectName: value, type: this.state.type })
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
