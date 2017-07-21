import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable, computed, extendObservable } from 'mobx'
import config from 'config'
import moment from 'moment'
import { Picker } from 'emoji-mart'
import * as CollaborationActions from './actions'
import ChatManager from './ot/chat'
import state from './state'
import ScrollToBottom from './ScrollToBottom'
import * as Modal from 'components/Modal/actions'
import { hueFromString, chroma } from 'utils/colors'
const os = (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()
const isMac = (os === 'mac')
import indexOf from 'lodash/indexOf'

const getTime = (time) => moment(new Date(time)).calendar()//.fromNow()

const ChatItem = observer(({ chat }) => {
  const { collaborator, timestamp, message } = chat
  const hue = hueFromString(collaborator.collaborator.name)
  const [r, g, b] = chroma.hsv2rgb(hue, 1, 0.8)
  const color = `rgb(${r},${g},${b})`
  return (
    <div className='chat-item' style={{
      borderColor: color,
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
      chatList: [],
      chatCount: 0,
      showEmoji: false,
    })
  }

  componentDidMount () {
    this.chatManager = new ChatManager()
    this.chatManager.subscribe((data) => {
      const { globalKey, message, timestamp } = data
      const collaborator = state.collaborators.find(item => item.collaborator.globalKey === globalKey)
      if (collaborator) {
        this.state.chatCount ++
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
      const { globalKey, action, id: clientId } = data
      // 被删除的是自己
      if (action === 'Remove' && globalKey === config.globalKey) {
        this.closePage()
      } else if (action === 'Add' || action === 'Remove') {
        this.fetchCollaborators()
      }
    })

    this.chatManager.onConnected(() => {
      this.chatManager.fetchStatus((userlist) => {
        userlist.forEach((data) => {
          this.setOnline(data)
        })
      })
    })

    this.chatManager.subscribeSelect(this.receiveSelection)
  }

  receiveSelection = (data) => {
    const { clientId, path } = data
    const collaborator = state.collaborators.find((item) => item.clientIds.indexOf(clientId) >= 0)
    if (collaborator) {
      collaborator.path = path
      state.paths[collaborator.collaborator.globalKey] = path
    }
  }

  closePage = async () => {
    const confirmed = await Modal.showModal('Alert', {
      header: 'Warning',
      message: `You're not in this collaboration now.`,
      okText: 'Quit'
    })
    if (confirmed) {
      location = '/dashboard'
    }
    Modal.dismissModal()
  }

  setOnline = (data) => {
    const { globalKey, action, id: clientId } = data
    const collaborator = state.collaborators.find(item => item.collaborator.globalKey === globalKey)
    if (collaborator) {
      if (!collaborator.clientIds) collaborator.clientIds = []
      if (action === 'Online' || action === 'Connect') {
        if (collaborator.clientIds.indexOf(clientId) === -1) {
          collaborator.clientIds.push(clientId)
        }
        collaborator.online = true
      } else if (action === 'Offline') {
        collaborator.clientIds.remove(clientId)
        collaborator.online = false
      }
    }
  }

  fetchCollaborators = () => {
    CollaborationActions.fetchCollaborators().then((res) => {
      this.chatManager.fetchStatus((userlist) => {
        userlist.forEach((data) => {
          this.setOnline(data)
        })
      })
    })
  }

  handleChange = (e) => {
    this.state.value = e.target.value
  }

  handleCommit = () => {
    if (this.state.value) {
      this.chatManager.send(this.state.value)
      this.state.value = ''
    }
  }

  handleEmojiClick = (emoji, e) => {
    const text = emoji.native
    if (document.selection) {
      // IE
      this.textarea.focus()
      const sel = document.selection.createRange()
      sel.text = text
    } else if (this.textarea.selectionStart || this.textarea.selectionStart === 0) {
      // Others
      const startPos = this.textarea.selectionStart
      const endPos = this.textarea.selectionEnd
      this.textarea.value = this.textarea.value.substring(0, startPos) +
        text +
        this.textarea.value.substring(endPos, this.textarea.value.length)
      this.textarea.selectionStart = startPos + text.length
      this.textarea.selectionEnd = startPos + text.length
    } else {
      this.textarea.value += text
    }
    this.state.value = this.textarea.value
    this.state.showEmoji = false
    this.textarea.focus()
  }

  handlePicker = (e) => {
    this.state.showEmoji = !this.state.showEmoji
  }

  handleHidePicker = (e) => {
    this.state.showEmoji = false
  }

  render () {
    let placeholder = ''
    if (isMac) {
      placeholder = 'Enter your message here (Cmd + Enter)'
    } else {
      placeholder = 'Enter your message here (Ctrl + Enter)'
    }
    const pickStyle = {
      visibility: 'hidden'
    }
    if (this.state.showEmoji) {
      pickStyle.visibility = 'visible'
    }
    return (
      <div className='collaboration-chat'>
        <ScrollToBottom className='chat-content' chatCount={this.state.chatCount}>
          {
            this.state.chatList.map(chat => <ChatItem chat={chat} key={chat.timestamp} />)
          }
        </ScrollToBottom>
        <div className='chat-editor'>
          <textarea
            ref={dom => this.textarea = dom}
            onClick={this.handleHidePicker}
            placeholder={placeholder}
            onChange={this.handleChange}
            value={this.state.value}
            onKeyDown={e => {if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) this.handleCommit()}}
          />
          <div className='chat-icons'>
            <div className='right'>
              <i className='fa fa-smile-o' onClick={this.handlePicker} />
            </div>
          </div>
        </div>
        {
          <Picker style={pickStyle} autoFocus set='emojione' emojiSize={16} native onClick={this.handleEmojiClick} title='Coding IDE' />
        }
      </div>
    )
  }
}

export default Chat
