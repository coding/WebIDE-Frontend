import React, { Component } from 'react'
import { dispatchCommand } from 'commands'
import { gitRemote } from 'backendAPI/gitAPI'
import * as NotificationActions from 'components/Notification/actions'

class ResetRemote extends Component {
  state = {
    address: ''
  }

  handleChangeAddress = (e) => {
    this.setState({
      address: e.target.value
    })
  }

  handleCommit = () => {
    const { address } = this.state
    gitRemote(address)
      .then((data) => {
        NotificationActions.notify({
          message: data.msg
        })
        dispatchCommand('modal:dismiss')
      })
  }

  render () {
    return (
      <div>
        <h2>{i18n`git.resetRemote.title`}</h2>
        <div className='form-group'>
          <label>{i18n`git.resetRemote.remoteAddress`}</label>
          <div className='form-line'>
            <input className='form-control'
              type='text'
              onChange={this.handleChangeAddress}
              placeholder='e.g. git@github.com:Author/Porject.git'
              value={this.state.address}
            />
          </div>
        </div>
        <div className='modal-ops settings-content-controls'>
          <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
          <button className='btn btn-primary' onClick={this.handleCommit}>Commit</button>
        </div>
      </div>
    )
  }
}

export default ResetRemote
