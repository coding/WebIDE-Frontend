/* @flow weak */
import React, { Component } from 'react';
import ModalContainer from '../components/Modal';
import Notification from '../components/Notification';

const Utilities = () => {
  return (
    <div className='utilities-container'>
      <ModalContainer />
      <Notification />
    </div>
  );
}

export default Utilities;
