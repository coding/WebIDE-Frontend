import React, { Component } from 'react'
import { observer } from 'mobx-react'
import * as CollaborationActions from './actions'
import state from './state'
import cx from 'classnames'
import config from 'config'
import * as Modal from 'components/Modal/actions'
import { hueFromString, chroma } from 'utils/colors'
import i18n from 'utils/createI18n'

const Collaborator = observer(({ item, handleDelete, handleQuit, isOwner, handleOpenFile, handleReject, handleAdd }) => {
  const { collaborator, id } = item
  let info = ''
  if (item.inviteBy === 'Owner') {
    info = (
      <div className='info-owner'>{i18n`ot.laberOwner`}</div>
    )
  } else if (isOwner) {
    if (item.status === 'Request') {
      info = (
        <div className='info-action'>
          <button className='btn btn-default btn-xs' onClick={e => handleAdd(collaborator.globalKey)} >
            {i18n`ot.btnAccept`}
          </button>
          <div className='info-request' onClick={e => handleReject(id, collaborator.globalKey)}>{i18n`ot.btnReject`}</div>
        </div>
      )
    } else {
      info = (
        <div className='info-delete' onClick={e => handleDelete(id, collaborator.globalKey)}>{i18n`ot.btnRemove`}</div>
      )
    }
  } else if (config.globalKey === collaborator.globalKey) {
    info = (
      <div className='info-delete' onClick={e => handleQuit(id, collaborator.globalKey)}>{i18n`ot.btnQuit`}</div>
    )
  }
  const online = (item.online || config.globalKey === collaborator.globalKey)
  const hue = hueFromString(collaborator.name)
  const [r, g, b] = chroma.hsv2rgb(hue, 1, 0.8)
  const color = `rgb(${r},${g},${b})`
  let avatarStyle = {}
  if (online) {
    avatarStyle = {
      borderColor: color,
      boxShadow: `0px 0px 8px 0px ${color}`
    }
  }
  return (
    <div className='collaborator'>
      <div className={cx(
        'dot',
        {
          online,
        }
      )}
      />
      <div className='avatar'>
        <img src={collaborator.avatar} style={avatarStyle}
        />
      </div>
      <div className='username'>
        {collaborator.name}
        {config.globalKey === collaborator.globalKey && (
          i18n`ot.labelYou`
        )}
        {item.path && online && (
          <span className='editing' onClick={(e) => {
            handleOpenFile(item.path)
          }}>{
            ` is editing ${item.path.split('/').pop()}`
          }</span>
        )}
      </div>
      <div className='info'>
        {info}
      </div>
    </div>
  )
})

@observer
class Collaborators extends Component {
  componentDidMount () {
    CollaborationActions.fetchCollaborators()
  }

  handleAdd = (globalKey) => {
    CollaborationActions.postCollaborators(globalKey)
  }

  handleReject = (id) => {
    CollaborationActions.rejectCollaborator(id)
  }

  handleDelete = async (id, globalKey) => {
    const confirmed = await Modal.showModal('Confirm', {
      header: i18n`ot.deleteCollaborator`,
      message: i18n`ot.deleteCollaboratorMsg${{ globalKey }}`,
      okText: i18n`ot.delete`
    })
    if (confirmed) {
      CollaborationActions.deleteCollaborators(id, globalKey)
      // .then((res) => {
      //   CollaborationActions.fetchCollaborators()
      // })
    }
    Modal.dismissModal()
  }

  handleQuit = async (id, globalKey) => {
    const confirmed = await Modal.showModal('Confirm', {
      header: i18n`ot.quitCollaboration`,
      message: i18n`ot.quitMsg`,
      okText: i18n`ot.quitButton`
    })
    if (confirmed) {
      CollaborationActions.deleteCollaborators(id, globalKey)
    }
    Modal.dismissModal()
  }

  handleOpenFile = (path) => {
    CollaborationActions.openFile({ path })
  }

  render () {
    const { collaborators, sortedList } = state
    const isOwner = state.isOwner
    return (
      <div className='collaborators'>
        { sortedList.map((item, i) => {
          return (
            <Collaborator
              item={item}
              key={item.collaborator.globalKey}
              handleDelete={this.handleDelete}
              handleQuit={this.handleQuit}
              isOwner={isOwner}
              handleOpenFile={this.handleOpenFile}
              handleAdd={this.handleAdd}
              handleReject={this.handleReject}
            />
          )
        })}
      </div>
    )
  }
}

export default Collaborators
