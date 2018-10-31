import React, { Component } from 'react'
import { observer } from 'mobx-react'
import debounce from 'lodash/debounce'
import { autorun } from 'mobx'
import { FsSocketClient } from 'backendAPI/websocketClients'
import api from 'backendAPI'
import cx from 'classnames'
import icons from 'file-icons-js'
import * as monaco from 'monaco-editor'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'
import { openFile } from 'commands/commandBindings/file'
import { createTab, activateTab } from 'components/Tab/actions'
import FileTreeState from 'components/FileTree/state'
import dispatchCommand from 'commands/dispatchCommand'
import state from './state'

class SearchResultItem extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isFolded: false
    }
  }
  handlePathClick = () => {
    this.setState({
      isFolded: !this.state.isFolded
    })
  }
  handleItemClick = (path, line) => {
    const selection = new monaco.Selection(
      line.line,
      line.indexes[0] + 1,
      line.line,
      line.indexes[0] + this.props.keyword.length + 1,
    )
    
    openFile({ path, editor: { filePath: path, selection } })
    // const fileTreeNode = FileTreeState.entities.get(path)
    // if (fileTreeNode) {
    //   dispatchCommand('file:open_file', {
    //     path: fileTreeNode.path,
    //     editor: { filePath: path, selection },
    //   })
    // } else {
    //   openFile({ path, editor: { filePath: path, selection } })
    // }
  }
  render () {
    const { path, value } = this.props
    const iconStr = 'file-icon ' + (icons.getClassWithColor(path) || 'fa fa-file-text-o')
    const idx = path.lastIndexOf('/') + 1
    const fileName = path.substring(idx)
    const filePath = path.substring(1, idx)
    const count = value.length
    return (
      <div className='search-item' key={path}>
        <div className='search-item-path' onClick={this.handlePathClick}>
          <i
            className={cx({
              'fa fa-caret-right': this.state.isFolded,
              'fa fa-caret-down': !this.state.isFolded
            })}
          />
          <i className={iconStr} />
          {fileName}
          <span className='search-item-path-path'>{filePath}</span>
          <span className='search-item-count'>{count}</span>
        </div>

        {!this.state.isFolded && value.map(line => {
          const contentStart = line.content.substring(0, line.indexes[0])
          const contentMiddle = line.content.substring(line.indexes[0], line.indexes[0] + this.props.keyword.length)
          const contentEnd = line.content.substring(line.indexes[0] + this.props.keyword.length)
          return (
            <div key={`${path}-${line.line}`} className='search-item-line' onClick={() => this.handleItemClick(path, line)}>
              <span className='search-item-content'>{contentStart}<h>{contentMiddle}</h>{contentEnd}</span>
            </div>
          )
        })}
      </div>
    )
  }
}

@observer
class SearchPanel extends Component {
  componentDidMount () {
    this.subscribeToFilesearch()
  }
  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.searchTxt()
    }
  }

  handleKeywordChange = (e) => {
    state.keyword = e.target.value
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    // this.confirm()
  }

  confirm = debounce(() => {
    this.searchTxt()
  }, 1000)

  searchTxt = () => {
    state.searching = true
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
        this.setDate(data)
      })
    })
  }

  setDate = debounce((data) => {
    if (data.taskId === state.taskId) {
      state.result = data
      state.searching = false
    }
  }, 500)

  renderResult () {
    let content = ''
    if (state.searching) {
      content = 'Searching...'
    } else if (state.result.results) {
      const keyword = state.result.keyword
      content = Object.entries(state.result.results).map(([key, value]) => {
        if (key.startsWith('/.git/')) return null
        return (<SearchResultItem keyword={keyword} path={key} key={key} value={value} />)
      })
    }

    return (
      <div className='search-result-list'>
        {content}
      </div>
    )
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
            placeholder={i18n.get('panel.left.find')}
          />
        </div>
        {this.renderResult()}
      </div>
    )
  }
}

export default SearchPanel
