/* @flow weak */
import React, { Component } from 'react'
import cx from 'classnames'
import {GitBranchWidget} from '../Git'

const StatusBar = () => {
  return (
    <div className='status-bar'>
      <div className='status-widget-container left' />
      <div className='status-widget-container right'><GitBranchWidget /></div>
    </div>
  )
}

export default StatusBar
