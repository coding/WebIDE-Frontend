import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Clipboard from 'clipboard'

import { showPublicSshKey } from 'backendAPI/projectAPI'
import { notify } from 'components/Notification/actions'
import { dismissModal } from 'components/Modal/actions'

class ImportFromGit extends PureComponent {
  static propTypes = {
    submit: PropTypes.func,
    url: PropTypes.string,
    showWarn: PropTypes.bool,
    onChange: PropTypes.func,
  }

  state = {
    key: '',
    showKey: false
  }

  componentDidMount () {
    showPublicSshKey().then((res) => {
      if (res.code === 0) {
        this.setState({ key: res.data.publicKey })
      } else {
        this.setState({ key: i18n.get('import.fetchKeyFailed') })
      }
    })
    const clipboard = new Clipboard('.clipboard', {
      text: trigger => trigger.parentElement.innerText,
    })
    clipboard.on('success', () => {
      notify({ message: i18n.get('import.copyKeySuccess') })
    })
    clipboard.on('error', () => {
      notify({ message: i18n.get('import.copyKeyFailed') })
    })
  }

  toggleSSHKeyShow = () => {
    this.setState({ showKey: !this.state.showKey })
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 108) {
      this.props.submit()
    }
  }

  render () {
    const { key, showKey } = this.state
    const { url, showWarn, onChange } = this.props
    return (
      <div className='import-from-git'>
        <div className='form'>
          <input
            className='form-control'
            type='text'
            value={url}
            onChange={onChange}
            onKeyDown={this.handleKeyDown}
          />
          {showWarn ? <span className='warn'>!</span> : ''}
        </div>
        <div className='tip'>
          <span>
            {i18n.get('import.beforeKey')}
            <span className='link' onClick={this.toggleSSHKeyShow}>
              {' SSH key '}
            </span>
            {i18n.get('import.afterKey')}
          </span>
          <span />
        </div>
        {showKey ? (
          <div className='box'>
            <i className='clipboard fa fa-copy' />
            {key}
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default ImportFromGit
