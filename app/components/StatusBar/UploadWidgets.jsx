import React, { Component } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import i18n from 'utils/createI18n'
import state from './state'
import Menu from 'components/Menu'
import filesize from 'filesize'

@observer
class UploadWidgets extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isActive: false
    }
  }

  toggleActive (isActive, isTogglingEnabled) {
    if (isTogglingEnabled) { isActive = !this.state.isActive }
    this.setState({ isActive })
  }

  makeModeMenuItems (uploadList) {
    return uploadList.map((mode) => ({
      key: mode[0],
      name: `${mode[0]} | ${filesize(mode[1].size)} | ${mode[1].percentCompleted} %`,
    }))
  }

  render () {
    const uploadList = state.uploadList.entries()
    if (uploadList.length === 0) return null
    let totalPercent = 0
    let totalSize = 0
    let totalUploadedSize = 0
    uploadList.forEach((item) => {
      const uploadedSize = (item[1].size * item[1].percentCompleted / 100)
      totalUploadedSize += uploadedSize
      totalSize += item[1].size
    })
    totalPercent = (totalUploadedSize / totalSize * 100).toFixed(2)

    let message = ''

    if (uploadList.length === 1) {
      message = (
        <div className='upload-message'>
          {totalPercent >= 100 ? i18n`file.uploadSucceed` : i18n`file.uploading`}
          {` ${uploadList[0][0]} | ${totalPercent} %`}
        </div>
      )
    } else {
      message = (
        <div className='upload-message'>
          Uploading {uploadList.length} files | {totalPercent} %
        </div>
      )
    }
    return (
      <div className='status-bar-upload' onClick={e => { this.toggleActive(true, true) }}>
        <i className='fa fa-upload' aria-hidden='true'></i>
        <div className='upload-messages'>
          {message}
          {/* {uploadList.map(item => <div className='upload-message'>{item[1]}</div>)} */}
          {this.state.isActive ?
          <div className='mode-widget'>
            <Menu className={cx('bottom-up to-left', { active: this.state.isActive })}
              style={{
                position: 'relative',
                border: 0,
              }}
              items={this.makeModeMenuItems(uploadList)}
              deactivate={this.toggleActive.bind(this, false)}
            />
          </div>
        : null}
        </div>
      </div>
    )
  }
}

export default UploadWidgets
