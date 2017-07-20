import React, { Component } from 'react'
import { observer } from 'mobx-react'
import * as CollaborationActions from './actions'
import state from './state'
import cx from 'classnames'
import config from 'config'
import * as Modal from 'components/Modal/actions'
import { hueFromString, chroma } from 'utils/colors'

const Collaborator = observer(({ item, handleDelete, handleQuit, isOwner, handleOpenFile }) => {
  const { collaborator, id } = item
  let info = ''
  if (item.inviteBy === 'Owner') {
    info = (
      <div className='info-owner'>Owner</div>
    )
  } else if (isOwner) {
    info = (
      <div className='info-delete' onClick={e => handleDelete(id, collaborator.globalKey)}>Remove</div>
    )
  } else if (config.globalKey === collaborator.globalKey) {
    info = (
      <div className='info-delete' onClick={e => handleQuit(id, collaborator.globalKey)}>Quit</div>
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
          ` (You)`
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

  handleDelete = async (id, globalKey) => {
    const confirmed = await Modal.showModal('Confirm', {
      header: 'Are you sure you want to remove this collaborator?',
      message: `You're trying to remove ${globalKey}`,
      okText: 'Delete'
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
      header: 'Are you sure you want to quit?',
      message: `You're trying to quit this collaboration.`,
      okText: 'Quit'
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
            />
          )
        })}
      </div>
    )
  }
}

export default Collaborators
