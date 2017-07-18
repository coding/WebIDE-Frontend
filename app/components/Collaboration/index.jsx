import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { AccordionGroup, Accordion } from '../Accordion/Accordion'
import Collaborators from './Collaborators'
import Chat from './Chat'
import * as Modal from '../../components/Modal/actions'
import state from './state'

@observer
class Collaboration extends Component {
  handleInvite = () => {
    Modal.showModal('CollaborationInvite')
  }

  render () {
    let action = null
    if (state.isOwner) {
      action = (
        <div className='accordion-actions' onClick={this.handleInvite}><i className='fa fa-user-plus' /> Invite</div>
      )
    }
    return (
      <AccordionGroup flexDirection='column'>
        <Accordion
          header='Collaborators'
          icon='fa fa-users'
          size='40'
          id='d1'
          actions={action}
        >
          <Collaborators />
        </Accordion>
        <Accordion
          header='Group Chat'
          icon='fa fa-comments'
          size='40'
          id='d2'
        >
          <Chat />
        </Accordion>
      </AccordionGroup>
    )
  }
}

export default Collaboration
