import React, { Component } from 'react'
import { observer } from 'mobx-react'
import debounce from 'lodash/debounce'
import { autorun } from 'mobx'
import { FsSocketClient } from 'backendAPI/websocketClients'
import api from 'backendAPI'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'
import state from './state'

@observer
class SearchPanel extends Component {
  componentDidMount () {
    this.subscribeToFilesearch()
  }
  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.confirm()
    }
  }

  handleKeywordChange = (e) => {
    state.keyword = e.target.value
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    this.confirm()
  }

  confirm = debounce(() => {
    console.log('confirm', state.keyword)
    this.searchTxt()
  }, 1000)

  searchTxt = () => {
    console.log('searchTxt', state.keyword)
    api.searchTxt(state.keyword).then((data) => {
      state.taskId = data.taskId
    }).catch((res) => {
      notify({ message: `Search failed: ${res.msg}`, notifyType: NOTIFY_TYPE.ERROR })
    })
  }
  subscribeToFilesearch = () => {
    autorun(() => {
      if (!config.fsSocketConnected) return
      const client = FsSocketClient.$$singleton.stompClient
      client.subscribe(`/topic/ws/${config.spaceKey}/txt/search`, (frame) => {
        const data = JSON.parse(frame.body)
        console.log('search', data)
      })
    })
  }

  render () {
    return (
      <div className='search-panel'>
        <div className='search-panel-title'>
          {i18n`panel.left.find`}
        </div>
        <div className='search-panel-input'>
          <input type='text'
            className='form-control'
            value={state.keyword}
            onChange={this.handleKeywordChange}
            onKeyDown={this.onKeyDown}
          />
        </div>
      </div>
    )
  }
}

export default SearchPanel
