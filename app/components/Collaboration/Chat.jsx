import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import config from 'config'
import moment from 'moment'
const getTime = (time) => moment(new Date(time)).fromNow()
import ChatManager from '../../utils/ot/chat'
import state from './state'

const ChatItem = observer(({ chat }) => {
  const { collaborator, timestamp, message } = chat
  return (
    <div className='chat-item' style={{
      borderColor: '#FF00FF',
    }}>
      <div className='chat-item-header'>
        <img src={collaborator.collaborator.avatar} />
        <div className='chat-item-username'>
          {collaborator.collaborator.name}
          {config.globalKey === collaborator.collaborator.globalKey && (
            ` (You)`
          )}
        </div>
        <div className='chat-item-time'>
          {getTime(timestamp)}
        </div>
      </div>
      <div className='chat-item-body'>
        {message}
      </div>
    </div>
  )
})

@observer
class Chat extends Component {
  constructor (props) {
    super(props)
    this.state = observable({
      value: '',
      chatList: []
    })
  }

  componentDidMount () {
    this.chatManager = new ChatManager()
    this.chatManager.subscribe((data) => {
      const { globalKey, message, timestamp } = data
      const collaborator = state.collaborators.find(item => item.collaborator.globalKey === globalKey)
      if (collaborator) {
        if (this.state.chatList.length > 0) {
          const lastChat = this.state.chatList[this.state.chatList.length - 1]
          if (lastChat.collaborator.collaborator.globalKey === collaborator.collaborator.globalKey) {
            lastChat.message += `
${message}`
            return
          }
        }
        const chat = {
          collaborator,
          message,
          timestamp,
        }
        this.state.chatList.push(chat)
      }
    })
    this.chatManager.subscribeStatus((data) => {
      this.setOnline(data)
    })

    this.chatManager.onConnected(() => {
      this.chatManager.fetchStatus((userlist) => {
        userlist.forEach((data) => {
          this.setOnline(data)
        })
      })
    })
  }

  setOnline = (data) => {
    const { globalKey, action } = data
    const collaborator = state.collaborators.find(item => item.collaborator.globalKey === globalKey)
    if (collaborator) {
      if (action === 'Online') {
        collaborator.online = true
      } else if (action === 'Offline') {
        collaborator.online = false
      }
    }
  }

  handleChange = (e) => {
    this.state.value = e.target.value
  }

  handleCommit = () => {
    this.chatManager.send(this.state.value)
    this.state.value = ''
  }

  render () {
    return (
      <div className='collaboration-chat'>
        <div className='chat-content'>
          {
            this.state.chatList.map(chat => <ChatItem chat={chat} key={chat.timestamp} />)
          }
        </div>
        <div className='chat-editor'>
          <textarea
            placeholder='Enter your message here'
            onChange={this.handleChange}
            value={this.state.value}
            onKeyDown={e => {if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) this.handleCommit()}}
          />
        </div>
      </div>
    )
  }
}

export default Chat
