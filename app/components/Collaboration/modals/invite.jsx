import React, { Component, PropTypes } from 'react'
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import { bindActionCreators } from 'redux'
import cx from 'classnames'
import { connect } from 'react-redux'
import { dispatchCommand } from '../../../commands'
import * as Modal from '../../Modal/actions'
import trim from 'lodash/trim'
import * as CollaborationActions from '../actions'
import state from '../state'
import { i18n } from 'utils'

const UserItem = observer(({ item, handleInvite, handleRemove }) => {
  const { inviteKey, id } = item
  return (
    <div className='user-item'>
      {/* <div className='avatar'>
        <img src={collaborator.avatar} />
      </div> */}
      <div className='username'>
        {inviteKey}
      </div>
      <div className='remove-btn' onClick={() => {
        handleRemove(id)
      }}>
        {i18n`ot.removeInvite`}
      </div>
      <div className='invite-btn' onClick={() => {
        handleInvite(inviteKey)
      }}>
        {i18n`ot.resendInvite`}
      </div>
    </div>
  )
})

@observer
class Invite extends Component {
  static propTypes = {
    // putProjectType: PropTypes.func.isRequired,
  }

  constructor (props) {
    super(props)
    this.state = observable({
      loading: false,
      value: '',
      error: '',
    })
  }

  componentDidMount () {
    CollaborationActions.fetchInvitedCollaborators()
    this.input.focus()
  }

  handleChange = (e) => {
    this.state.value = e.target.value
  }

  handleInvite = (name) => {
    this.state.loading = true
    CollaborationActions.postCollaborators(name).then((res) => {
      // CollaborationActions.fetchCollaborators()
      dispatchCommand('modal:dismiss')
    }).catch((res) => {
      this.state.loading = false
      this.state.error = res.msg
    })
  }

  handleRemove = (id) => {
    CollaborationActions.deleteCollaborators(id).then(() => {
      CollaborationActions.fetchInvitedCollaborators()
    })
  }

  render () {
    const { invited } = state
    return (
      <div className='invite-container'>
        <h2>
          {i18n`ot.shareWS`}
        </h2>
        <div className='form-group'>
          <label>{i18n`ot.inviteTitle`}</label>
          <div className='form-line'>
            <input className='form-control'
              type='text'
              placeholder={i18n.get('ot.sharePlaceHolder')}
              onChange={this.handleChange}
              value={this.state.value}
              ref={dom => this.input = dom}
              onKeyDown={e => {if (e.keyCode === 13) this.handleInvite(this.state.value)}}
            />
            <button disabled={this.state.loading || (!this.state.value)} className="btn btn-default" onClick={e => this.handleInvite(this.state.value)} >{i18n`ot.inviteBtn`}</button>
          </div>
          {this.state.error && (
            <div className='form-line'>
              <div className='error-info'>
                {this.state.error}
              </div>
            </div>
          )}
        </div>
        {invited.length > 0 && <div className='form-group'>
          <label>{i18n`ot.waitVerify`}</label>
          <div className='user-list'>
            {
              invited.map((item, i) => {
                return <UserItem item={item} key={item.inviteKey} handleInvite={this.handleInvite} handleRemove={this.handleRemove} />
              })
            }
          </div>
        </div>}
      </div>
    )
  }
}

export default Invite = connect(
  state => state,
  dispatch => ({ ...bindActionCreators(CollaborationActions, dispatch), ...Modal })
)(Invite)
