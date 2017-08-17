import React, { Component, PropTypes } from 'react'
import { inject } from 'mobx-react'
import { emitter, E } from 'utils'
import cx from 'classnames'
import i18n from 'utils/createI18n'
import config from '../../config'


// 三个状态 1. connected(两个socket全链接)  2. disconnected可点击 3. connecting
@inject(() => ({
  fsSocketConnected: config.fsSocketConnected,
}))
class Offline extends Component {
  state = {
    showButton: false,
    isConnecting: false,
  }

  componentDidMount () {
    emitter.on(E.SOCKET_TRIED_FAILED, () => {
      this.setState({ showButton: true, isConnecting: false })
    })
  }
  componentWillReceiveProps (np) {
    if ((np.fsSocketConnected !== this.props.fsSocketConnected) && (np.fsSocketConnected === true)) {
      this.setState({ isConnecting: false }, () => {
        setTimeout(() => {
          this.setState({ showButton: false })
        }, 10000)
      })
    }
  }
  render () {
    const isConnecting = this.state.isConnecting
    const isConnected = this.props.fsSocketConnected
    if (!this.state.showButton) {
      return null
    }

    let buttonStatusClass = 'btn-danger'
    if (isConnecting) {
      buttonStatusClass = 'btn-primary'
    } else if (isConnected) {
      buttonStatusClass = 'btn-success'
    } else {
      buttonStatusClass = 'btn-danger'
    }

    return (<div className={cx('offline-container btn toggle btx-xs',
  buttonStatusClass,
  !isConnecting && !isConnected && 'off',
  isConnecting && 'blink')}
    >
      <div className='toggle-group' onClick={() => {
        this.setState({ isConnecting: true })
        emitter.emit(E.SOCKET_RETRY)
      }}
      >
        <span className={cx('btn toggle-on btn-xs', isConnecting ? 'btn-primary' : 'btn-success')}>
          {i18n`global.online`}
        </span>
        <span className='btn toggle-off btn-xs btn-danger'>{i18n`global.offline`}</span>
        <span className='toggle-handle btn btn-default btn-xs' />
      </div>
    </div>)
  }
}

Offline.propTypes = {
  fsSocketConnected: PropTypes.bool
}

export default Offline
