import React, { Component } from 'react'
import { observer } from 'mobx-react'
import state from './state'
import cx from 'classnames'

@observer
class FileList extends Component {
  handleActivate (tab) {
    tab.activate()
  }
  handleDestroy (tab) {
    tab.destroy()
  }
  render () {
    return (
      <div className='file-list-container'>
        {state.tabs.values().map((tab) => {
          return (
            <div className={cx('file-list-item', { focus: tab.isActive })} onClick={e => this.handleActivate(tab)}>
              <i className='fa fa-times' onClick={e => {
                e.preventDefault()
                this.handleDestroy(tab)
              }} />
              <i className={tab.icon} />
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
