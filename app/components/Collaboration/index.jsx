import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { AccordionGroup, Accordion } from '../Accordion/Accordion'
import Collaborators from './Collaborators'
import Chat from './Chat'
import * as Modal from '../../components/Modal/actions'

@observer
class Collaboration extends Component {
  handleInvite = () => {
    Modal.showModal('CollaborationInvite')
  }

  render () {
    return (
      <AccordionGroup flexDirection='column'>
        <Accordion
          header='Collaborators'
          size='40'
          id='d1'
          actions={<div className='accordion-actions' onClick={this.handleInvite}>+ Invite</div>}
        >
          <Collaborators />
        </Accordion>
        <Accordion header='Group Chat' size='40' id='d2'>
          <Chat />
        </Accordion>
      </AccordionGroup>
    )
  }
}

export default Collaboration
