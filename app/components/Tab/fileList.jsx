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
        {state.tabs.entries().map((tab) => {
          return (
            <div className={cx('file-list-item', { focus: tab[1].isActive })} onClick={e => this.handleActivate(tab[1])}>
              <i className='fa fa-times' onClick={e => {
                e.preventDefault()
                this.handleDestroy(tab[1])
              }} />
              <i className={tab[1].icon} />
              <span className={cx('file-list-label', `git-${tab[1].file.gitStatus ? tab[1].file.gitStatus.toLowerCase() : 'none'}`)}>
                {tab[1].file.name}
              </span>
            </div>
          )
        })}
      </div>
    )
  }
}

export default FileList
