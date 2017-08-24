import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import cx from 'classnames'
import i18n from 'utils/createI18n'
import state from '../state'
import * as Modal from 'components/Modal/actions'
import Step1 from './step1'
import Step2 from './step2'
import Step3 from './step3'
import Step4 from './step4'
import * as WorkspaceActions from '../actions'

@observer
class PluginProjectView extends Component {
  constructor(props) {
    super(props)
  }

  // next = async () => {
  //   Modal.dismissModal()
  //   await Modal.showModal('WizardPluginContent')
  //   Modal.dismissModal()
  // }
  next () {
    if (state.wizard.step < state.wizard.maxStep) {
      state.wizard.step ++
    }
  }

  back () {
    if (state.wizard.step > 1) {
      state.wizard.step --
    }
  }

  finish () {
    const { createWorkspace } = this.props
    createWorkspace({ projectName: state.wizard.name, templateName: 'demo' })
    state.wizard.showModal = false
  }

  dismissModal () {
    state.wizard.showModal = false
  }

  renderStep (step) {
    switch (step) {
      case 1:
        return <Step1 />
      case 2:
        return <Step2 />
      case 3:
        return <Step3 />
      case 4:
        return <Step4 />
      default:
        return <div></div>
    }
  }

  render () {
    const { step, maxStep, name } = state.wizard
    return (
      <div className='import-plugin-container'>
        {this.renderStep(step)}
        <hr />
        <div className='modal-ops'>
          <button className='btn btn-default' onClick={e => this.dismissModal()}>Cancel</button>
          <button className='btn btn-default' disabled={step === 1} onClick={e => this.back()}>Back</button>
          <button className='btn btn-default' disabled={step === maxStep} onClick={e => this.next()}>Next</button>
          <button className='btn btn-primary' disabled={!name} onClick={e => this.finish()}>Finish</button>
        </div>
      </div>
    )
  }
}


PluginProjectView = connect(
  null,
  dispatch => bindActionCreators(WorkspaceActions, dispatch)
)(PluginProjectView)
export default PluginProjectView
