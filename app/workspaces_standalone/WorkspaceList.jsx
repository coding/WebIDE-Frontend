import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as WorkspaceActions from './actions'
import * as Modal from 'components/Modal/actions'
import i18n from 'utils/createI18n'
import state from './state'
import WizardPluginProjectView from './modals/pluginProject'
import { observer } from 'mobx-react'

@observer
class WorkspaceList extends Component {
  constructor (props) {
    super(props)
    this.state = { showPublicKey: false, percent: 0, hasCreated: false }
    this.handleTemplate = this.handleTemplate.bind(this)
  }

  componentDidMount () {
    this.props.fetchWorkspaceList()
    this.props.fetchPublicKey()
  }

  componentWillReceiveProps (nextProps) {
    // isCreating true -> false
    if (this.props.isCreating && !nextProps.isCreating) this.setState({ hasCreated: true })
    // isCreating false -> true
    if (!this.props.isCreating && nextProps.isCreating) this.changePercent()
  }

  handleTemplate = () => {
    state.wizard.step = 1
    this.showModal()
  }

  showModal () {
    state.wizard.showModal = true
  }

  dismissModal () {
    state.wizard.showModal = false
  }

  changePercent () {
    let curPercent = 0

    const addPercent = () => {
      let increment = Math.floor((500 + 3000 * Math.random()) / 1000)
      curPercent += increment

      // wait at 95% till next condition turn valid
      if (!this.state.hasCreated && curPercent > 90) curPercent = 95

      if (this.state.hasCreated || curPercent >= 100) {
        setTimeout(() => this.setState({ percent: 0, hasCreated: false }), 1000)
        return this.setState({ percent: 100 })
      }

      setTimeout(() => {
        this.setState({ percent: curPercent })
        addPercent()
      }, increment * 150)
    }

    addPercent()
  }

  render () {
    const {workspaces, publicKey, fingerprint, isCreating, errMsg, ...actionProps} = this.props
    const {openWorkspace, createWorkspace, deleteWorkspace} = actionProps
    return (
      <div className='workspace-list'>
        <div className='create-workspace-container'>
          <div>
            <h3>Create Workspace</h3>
            <p>1. Ensure you have add the public key to your account.
              {this.state.showPublicKey ? <a href='#' onClick={e => this.setState({showPublicKey: false})}> Hide public key</a>
                : <a href='#' onClick={e => this.setState({showPublicKey: true})}> Show public key</a>}
            </p>
            {this.state.showPublicKey ? <div>
              <div className='pre'>{publicKey}</div>
            </div> : null }
            <p>2. Clone from a git repo. (Only SSH is supported.)</p>
          </div>
          <div className='create-workspace-controls'>
            <input type='text'
              className='form-control'
              placeholder='git@github.com:username/project.git'
              ref={n => this.gitUrlInput = n} />
            { isCreating
              ? <button className='btn btn-default' disabled='true'>Creating</button>
              : <button className='btn btn-default'
                  onClick={e => createWorkspace({ url: this.gitUrlInput.value })}>
                  Create
                </button>
            }
          </div>
          { (isCreating || this.state.hasCreated) && !errMsg ? <p className="creating-workspace-process">
            Creating workspace...{this.state.percent}%</p> : null}
          { errMsg ? <p className='creating-workspace-indicator-error'>Error: {errMsg}</p> : null }
          <div className="strike">
              <span> OR </span>
          </div>
          <div>
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp;You can <a href='#' onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                this.handleTemplate()
              }}
              >use template wizard</a>
            </p>
          </div>
        </div>
        <div className='workspace-list-container'>
          { workspaces.map(ws =>
            <div key={ws.spaceKey} className='workspace'>
              <div className='workspace-name'>{ws.projectName}</div>
              <div className='workspace-action'>
                <a className='btn btn-default'
                  href={`/ws/${ws.spaceKey}`}
                  onClick={e => openWorkspace(ws)}>Open</a>
                <button className='btn btn-danger'
                  style={{marginLeft: '4px'}}
                  onClick={e => deleteWorkspace(ws.spaceKey)} >
                  Delete
                </button>
              </div>
            </div>
          ) }
        </div>
        {/* <Utilities /> */}
        <div className='utilities-container'>
          {state.wizard.showModal &&
          <div className='modals-container'>
            <div className='top modal-container show-backdrop'>
              <div className='modal'>
              <WizardPluginProjectView />
              </div>
              <div className='backdrop' onClick={this.dismissModal} />
            </div>
          </div>}
        </div>
      </div>
    )
  }
}

WorkspaceList = connect(
  state => state,
  dispatch => bindActionCreators(WorkspaceActions, dispatch)
)(WorkspaceList)

export default WorkspaceList
