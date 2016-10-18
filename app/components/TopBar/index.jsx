/* @flow weak */
import React, { Component } from 'react'
import MenuBar from '../MenuBar'
import Breadcrumbs from '../Breadcrumbs'

const TopBar = () => {
  return (
    <div className='top-bar'>
      <MenuBar />
      <Breadcrumbs />
    </div>
  )
}

export default TopBar
