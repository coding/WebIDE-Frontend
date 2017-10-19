import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { FileListState } from './state'
import cx from 'classnames'
import dispatchCommand from 'commands/dispatchCommand'

const state = FileListState


@observer
class FileList extends Component {
  handleActivate (tab) {
    // tab.activate()
    dispatchCommand('file:open_exist_file', tab.file.path)
  }
  handleDestroy (tab) {
    // tab.destroy()
    state.tabs.delete(tab.file.path)
  }
  render () {
    return (
      <div className='file-list-container'>
        {state.tabs.values().map((tab) => {
          return (
            <div key={tab.id} className={cx('file-list-item', { focus: tab.isActive })} onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              this.handleActivate(tab)
            }}>
              <i className='fa fa-times' onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                this.handleDestroy(tab)
              }} />
              <i className={`icon ${tab.icon}`} />
              {tab.file ?
                <span className={cx('file-list-label', `git-${tab.file.gitStatus ? tab.file.gitStatus.toLowerCase() : 'none'}`)}>
                  {tab.file.name}
                </span> :
                <span className='file-list-label git-none'>
                  {tab.title}
                </span>
              }
            </div>
          )
        })}
      </div>
    )
  }
}

export default FileList
