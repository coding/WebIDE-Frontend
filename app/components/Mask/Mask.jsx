import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import state from './state'
import { Line } from 'rc-progress'
import i18n from 'utils/createI18n'
import * as maskActions from 'components/Mask/actions'
import { emitter, E } from 'utils'
// import * as Modal from 'components/Modal/actions'

const url = 'https://studio-res.coding.net/DemoVideo/%E4%B8%80%E5%88%86%E9%92%9F%E9%83%A8%E7%BD%B2.mp4'

@observer
class Mask extends Component {
  constructor (props) {
    super(props)
    this.state = {
      connected: false
    }
  }

  componentDidMount () {
    emitter.on(E.SOCKET_CONNECT, this.firstConnectSuc)
  }

  firstConnectSuc = () => {
    this.setState({ connected: true })
  }

  firstEnterHandler = () => {
    localStorage.setItem('firstEnter', true)
    maskActions.hideMask()
  }

  isFirstEnter = () => !localStorage.getItem('firstEnter')

  renderVideoPlayer = () => {
    if (!localStorage.getItem('firstEnter')) {
      return <video className='mask-video' src={url} autoPlay controls />
    }
    return null
  }

  render () {
    const { connected } = this.state
    let content = null
    if (state.type === 'switch') {
      content = (
        <div className='progress'>
          {i18n`global.ttyConnectFailed`}
          <div className='progress-btn'>
            <button
              className='btn btn-primary'
              onClick={() => {
                maskActions.hideMask(0)
                // Modal.showModal('Alert', {
                //   header: i18n`global.ttyConnectFailed`,
                //   message: '',
                // })
              }}
            >{i18n`modal.okButton`}</button>
          </div>
        </div>
      )
    } else {
      content = (
        <div className='progress'>
          <i className='fa fa-cog fa-spin' />
          {state.operatingMessage}
          {state.countdown > 0 && (
            <div className='progress-line'>
              <Line
                percent={state.progress}
                strokeWidth='4'
                trailWidth='4'
                strokeColor='#5097E8'
                trailColor='#323a45'
              />
            </div>
          )}
        </div>
      )
    }
    if (state.operating) {
      return (
        <div className='mask-container'>
          {this.renderVideoPlayer()}
          {!connected && content}
          {connected &&
            this.isFirstEnter() && (
              <button className='btn btn-primary' onClick={this.firstEnterHandler}>
                立即开始
              </button>
            )}
        </div>
      )
    }
    return <div />
  }
}

export default Mask
