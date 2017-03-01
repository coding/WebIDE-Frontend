/* @flow weak */
import React, { Component } from 'react'
import cx from 'classnames'

import {GitBranchWidget} from '../Git'
import { dispatchCommand } from '../../commands'
const StatusBar = () => {
  return (
    <div className='status-bar'>
      <div className='status-widget-container left'>
        <div className='toggle-layout fa fa-desktop' onClick={e => dispatchCommand('view:toggle_bars')} ></div>
      </div>
      <div className='status-widget-container right'>
        <GitBranchWidget ref={ com => { window.refs.GitBranchWidget = com }}
        /></div>
    </div>
  )
}

export default StatusBar
