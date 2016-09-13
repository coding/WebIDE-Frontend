import React, { Component, PropTypes } from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';

import GitCommitView from '../Git';

var ModalContainer, Modal, GitCommitModal;

Modal = (props) => <div className='modal'>{props.children}</div>

ModalContainer = ({isActive, showBackdrop, position, modalType, content, dispatch}) => {
  if (!isActive) return null;

  var modalContent = function () {
    switch (modalType) {
      case 'GitCommit':
        return <GitCommitModal />

      default:
        return <Modal>{content}</Modal>
    }
  }();

  return (
    <div className={cx('modal-container', position, {
      'show-backdrop': showBackdrop
    })} >{modalContent}</div>
  );
}

ModalContainer = connect(
  state => state.ModalState
, null
)(ModalContainer);

GitCommitModal = () => {
  return (
    <Modal>
      <GitCommitView />
    </Modal>
  )
}

export default ModalContainer;
