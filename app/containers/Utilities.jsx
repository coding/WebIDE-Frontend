/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ModalContainer from '../components/Modal'
import Notification from '../components/Notification'
import DragAndDrop from '../components/DragAndDrop'

const Utilities = () => {
  return (
    <div className='utilities-container'>
      <ModalContainer />
      <Notification />
      <DragAndDrop />
    </div>
  )
}

export default Utilities
