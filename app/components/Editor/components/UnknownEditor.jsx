import React, { Component } from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import config from 'config'
import api from '../../../backendAPI'

class UnknownEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fileUrl: this.getFileUrl(),
      fileExt: this.getFileExt()
    }
    this.getFileUrl = this.getFileUrl.bind(this)
    this.getFileExt = this.getFileExt.bind(this)
    this.handleDownload = this.handleDownload.bind(this)
  }

  getFileUrl () {
    const { baseURL, spaceKey } = config
    return `${baseURL}/workspaces/${spaceKey}/raw?path=${encodeURIComponent(this.props.path)}`
  }

  getFileExt () {
    const dotPos = this.props.path.lastIndexOf('.')
    if (dotPos > 0) {
      return this.props.path.split('.').slice(-1)[0]
    } else {
      return 'bin'
    }
  }

  handleDownload () {
    api.downloadFile(this.props.path, false)
  }

  render () {
    console.log('this.props.size', this.props.size)
    return (
      <div style={{ textAlign: 'center', height: '100%' }} className='unknown-viewer-container' >
        <div className='unknown-viewer-content' onClick={this.handleDownload} >
          {/* <a href={this.state.fileUrl} target='_blank' rel='noopener noreferrer' > */}
            <div className='c-download-file folded-corner'>
              <div className='c-cloud'>
                <i className='fa fa-cloud-download' />
              </div>
              <div className={`c-file-ext c-ext-${this.state.fileExt} c-ellipsis`}>
                {this.state.fileExt}
              </div>
            </div>
          {/* </a> */}
        </div>
        <div className='unknown-file-info'>
          {`${this.props.path} - ${filesize(this.props.size)}`}
        </div>
      </div>
    )
  }
}

UnknownEditor.propTypes = {
  path: PropTypes.string,
  size: PropTypes.number
}

export default UnknownEditor
