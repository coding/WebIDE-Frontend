import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import state from './state'
import { Line } from 'rc-progress'

@observer
class Mask extends Component {
  render () {
    if (state.operating) {
      return (
        <div className='mask-container'>
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
        </div>
      )
    }
    return <div />
  }
}

export default Mask
