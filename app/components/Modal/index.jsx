import React, { Component, PropTypes } from 'react';
import cx from 'classnames';
import { connect } from 'react-redux';
import {
  Prompt,
  Confirm,
  SettingsView,
  CommandPalette,
  FilePalette,
  GitCommitView,
  GitStashView,
  GitUnstashView,
  GitResetView,
  GitTagView,
  GitMergeView,
  GitNewBranchView,
  GitRebaseStart,
  GitResolveConflictsView,
  GitMergeFileView,
  GitDiffFileView,
  GitRebasePrepare,
  GitRebaseInput,
  GitCommitDiffView,
  GitCheckoutView,
  GitCheckoutStashView,
} from './modals'

var ModalContainer = (props) => {
  const {dispatch} = props;
  const hasModal = props.stack.length > 0;
  return hasModal ? <div className={cx('modals-container')}>
    { props.stack.map(modalConfig => {
      const {id, isActive, showBackdrop, position} = modalConfig;
        return isActive
        ? <div key={id} className={cx(
            position,
            'modal-container',
            {'show-backdrop': showBackdrop}
          )} >
            <Modal {...modalConfig} />
            <div className='backdrop'
              onClick={e=>dispatch({type:'MODAL_DISMISS'})} />
          </div>
        : null
    }) }
  </div> :null;
}
ModalContainer = connect(state => state.ModalState, null)(ModalContainer)


class Modal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {type, content} = this.props

    var modalContent = function () {
      switch (type) {
        case 'GitCommit':
          return <GitCommitView {...this.props} />

        case 'GitResolveConflicts':
          return <GitResolveConflictsView {...this.props} />

        case 'GitCommitDiff':
          return <GitCommitDiffView {...this.props} />

        case 'GitStash':
          return <GitStashView {...this.props} />

        case 'GitUnstash':
          return <GitUnstashView {...this.props} />

        case 'GitTag':
          return <GitTagView {...this.props} />

        case 'GitMerge':
          return <GitMergeView {...this.props} />

        case 'GitNewBranch':
          return <GitNewBranchView {...this.props} />

        case 'GitResetHead':
          return <GitResetView {...this.props} />

        case 'GitRebaseStart':
          return <GitRebaseStart {...this.props} />

        case 'GitRebasePrepare':
          return <GitRebasePrepare {...this.props} />

        case 'GitRebaseInput':
          return <GitRebaseInput {...this.props} />

        case 'GitMergeFile':
          return <GitMergeFileView {...this.props} />

        case 'GitDiffFile':
          return <GitDiffFileView {...this.props} />

        case 'GitCheckout':
          return <GitCheckoutView {...this.props} />

        case 'GitCheckoutStash':
          return <GitCheckoutStashView {...this.props} />

        case 'Prompt':
          return <Prompt {...this.props} />

        case 'Confirm':
          return <Confirm {...this.props} />

        case 'CommandPalette':
          return <CommandPalette {...this.props} />

        case 'FilePalette':
          return <FilePalette {...this.props} />

        case 'Settings':
          return <SettingsView {...this.props} />

        default:
          return content
      }
    }.call(this)

    return <div className='modal'>{modalContent}</div>
  }

  dismiss = e => {
    if (e.keyCode === 27) {
      this.props.dispatch({ type: 'MODAL_DISMISS' })
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.dismiss)
  }

  componentWillUnmount() {
    // this.props.meta.reject()  // always reject any pending promise when unmount.
    window.removeEventListener('keydown', this.dismiss)
  }
}


export default ModalContainer;
