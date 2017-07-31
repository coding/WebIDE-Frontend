import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { i18n } from 'utils'
import { AccordionGroup, Accordion } from '../Accordion/Accordion'
import Collaborators from './Collaborators'
import Chat from './Chat'
import * as Modal from 'components/Modal/actions'
import state from './state'
import Menu from 'components/Menu'
import * as Actions from './actions'

@observer
class Collaboration extends Component {
  constructor (props) {
    super(props)
    this.state = observable({
      showDropdownMenu: false,
    })
  }
  handleInvite = () => {
    Modal.showModal('CollaborationInvite')
  }

  handleDropdown = (e) => {
    // e.preventDefault()
    e.stopPropagation()
    this.setState({ showDropdownMenu: true })
  }

  clearChat = () => {
    state.chatList = []
    Actions.saveChat()
  }

  renderDropdownMenu = () => {
    if (!this.state.showDropdownMenu) return null
    return (
      <Menu className='top-down to-left'
        items={[
          {
            name: i18n`ot.clear`,
            command: this.clearChat,
            icon: 'fa fa-trash-o'
          }
        ]}
        style={{ right: '2px' }}
        deactivate={e => this.setState({ showDropdownMenu: false })}
      />
    )
  }

  render () {
    let action = null
    if (state.isOwner) {
      action = (
        <div className='accordion-actions' onClick={this.handleInvite}><i className='fa fa-user-plus' /> {i18n`ot.invite`}</div>
      )
    }
    const chatSetting = (
      <div className='accordion-actions chatSetting' onClick={this.handleDropdown}>
        <i className='fa fa-cog' /> <i className='fa fa-sort-desc' />
        {this.renderDropdownMenu()}
      </div>
    )
    return (
      <AccordionGroup flexDirection='column'>
        <Accordion
          header={i18n`ot.collaborators`}
          icon='fa fa-users'
          size='40'
          id='d1'
          key='d1'
          actions={action}
        >
          <Collaborators />
        </Accordion>
        <Accordion
          header={i18n`ot.groupChat`}
          icon='fa fa-comments'
          size='40'
          id='d2'
          key='d2'
          actions={chatSetting}
        >
          <Chat />
        </Accordion>
      </AccordionGroup>
    )
  }
}

export default Collaboration
