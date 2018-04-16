import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import state from './state'
import { Line } from 'rc-progress'
import i18n from 'utils/createI18n'
import * as maskActions from 'components/Mask/actions'
// import * as Modal from 'components/Modal/actions'

@observer
class Mask extends Component {
  render () {
    let content = null
    if (state.type === 'switch') {
      content = (
        <div className='progress'>
          {i18n`global.ttyConnectFailed`}
          <div className='progress-btn'>
            <button className='btn btn-primary'
              onClick={() => {
                maskActions.hideMask(0)
                // Modal.showModal('Alert', {
                //   header: i18n`global.ttyConnectFailed`,
                //   message: '',
                // })
              }
              }
            >{i18n`modal.okButton`}</button>
          </div>
        </div>
      )
    } else {
      content = (
        <div className='progress'>
          <i className='fa fa-cog fa-spin' />
          {state.operatingMessage}

          {
            state.countdown > 0 && (
              <div className='progress-line'>
                <Line percent={state.progress} strokeWidth='4' trailWidth='4' strokeColor='#5097E8' trailColor='#323a45' />
              </div>
            )
          }
        </div>
      )
    }
    if (state.operating) {
      return (
        <div className='mask-container'>
          {content}
        </div>
      )
    }
    return <div />
  }
}

export default Mask
