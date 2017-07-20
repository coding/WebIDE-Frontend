import React, { Component } from 'react'
import cx from 'classnames'
import { observer, inject } from 'mobx-react'
import ModalState from './state'
import { dismissModal } from './actions'

import {
  Prompt,
  Confirm,
  Alert,
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
  CollaborationInviteView,
} from './modals'

let ModalContainer = observer(props => {
  if (props.stack.length === 0) return null
  return (
    <div className={cx('modals-container')}>
      {props.stack.map(modalConfig => {
        const { id, isActive, showBackdrop, position } = modalConfig
        if (!isActive) return null
        return (
          <div key={id}
            className={cx(position, 'modal-container', { 'show-backdrop': showBackdrop })}
          >
            <Modal modalConfig={modalConfig} />
            <div className='backdrop' onClick={dismissModal} />
          </div>
        )
      })}
    </div>
  )
})

ModalContainer = inject(() => {
  return { stack: ModalState.stack }
})(ModalContainer)

@observer
class Modal extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const modalConfig = this.props.modalConfig
    const { type, content } = modalConfig

    var modalContent = function () {
      switch (type) {
        case 'GitCommit':
          return <GitCommitView {...modalConfig} />

        case 'GitResolveConflicts':
          return <GitResolveConflictsView {...modalConfig} />

        case 'GitCommitDiff':
          return <GitCommitDiffView {...modalConfig} />

        case 'GitStash':
          return <GitStashView {...modalConfig} />

        case 'GitUnstash':
          return <GitUnstashView {...modalConfig} />

        case 'GitTag':
          return <GitTagView {...modalConfig} />

        case 'GitMerge':
          return <GitMergeView {...modalConfig} />

        case 'GitNewBranch':
          return <GitNewBranchView {...modalConfig} />

        case 'GitResetHead':
          return <GitResetView {...modalConfig} />

        case 'GitRebaseStart':
          return <GitRebaseStart {...modalConfig} />

        case 'GitRebasePrepare':
          return <GitRebasePrepare {...modalConfig} />

        case 'GitRebaseInput':
          return <GitRebaseInput {...modalConfig} />

        case 'GitMergeFile':
          return <GitMergeFileView {...modalConfig} />

        case 'GitDiffFile':
          return <GitDiffFileView {...modalConfig} />

        case 'GitCheckout':
          return <GitCheckoutView {...modalConfig} />

        case 'GitCheckoutStash':
          return <GitCheckoutStashView {...modalConfig} />

        case 'Prompt':
          return <Prompt {...modalConfig} />

        case 'Confirm':
          return <Confirm {...modalConfig} />

        case 'Alert':
          return <Alert {...modalConfig} />

        case 'CommandPalette':
          return <CommandPalette {...modalConfig} />

        case 'FilePalette':
          return <FilePalette {...modalConfig} />

        case 'Settings':
          return <SettingsView {...modalConfig} />

        case 'CollaborationInvite':
          return <CollaborationInviteView {...modalConfig} />

        default:
          return content
      }
    }.call(this)

    return <div className='modal'>{modalContent}</div>
  }

  dismiss = e => {
    if (e.keyCode === 27) {
      dismissModal()
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
