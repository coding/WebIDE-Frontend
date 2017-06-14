import React, { PropTypes } from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'


import { GitBranchWidget } from '../Git'
import { dispatchCommand } from '../../commands'
const StatusBar = ({ uploadProgress }) => {
  return (
    <div className='status-bar'>
      <div className='status-widget-container left'>
        <div className='toggle-layout fa fa-desktop' onClick={e => dispatchCommand('view:toggle_bars')} ></div>
        <div>{uploadProgress}</div>
      </div>
      <div className='status-widget-container right'>
        <GitBranchWidget ref={ com => { window.refs.GitBranchWidget = com }}
        /></div>
    </div>
  )
}

StatusBar.propTypes = {
  uploadProgress: PropTypes.string
}

export default connect(state => {
  const {
    StatusBarState: { uploadProgress = '' }
  } = state
  return { uploadProgress }
})(StatusBar)
