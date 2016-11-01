/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as WorkspaceActions from './actions'

class WorkspaceList extends Component {
  constructor (props) {
    super(props)
    this.state = {showPublicKey: false}
  }

  componentDidMount () {
    this.props.fetchWorkspaceList()
    this.props.fetchPublicKey()
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
              {this.state.showPublicKey ? <a onClick={e => this.setState({showPublicKey: false})}> Hide public key</a>
              : <a onClick={e => this.setState({showPublicKey: true})}> Show public key</a>}
            </p>
            {this.state.showPublicKey ? <div><div className='pre'>{publicKey}</div></div> : null }
            <p>2. Clone from a git repo. (Only SSH is supported.)</p>
          </div>
          <div className='create-workspace-controls'>
            <input className='form-control' type='text' placeholder='git@github.com:username/project.git'
              ref={n => this.gitUrlInput = n} />
            { isCreating ? <button className='btn btn-default' disabled='true'>Creating</button>
              : <button className='btn btn-default'
                onClick={e => createWorkspace(this.gitUrlInput.value)}>Create</button> }
          </div>
          { isCreating ? <p className='creating-workspace-indicator'>Creating</p> : null }
          { errMsg ? <p className='creating-workspace-indicator-error'>Error: {errMsg}</p> : null }
        </div>
        <div className='workspace-list-container'>
          { workspaces.map(ws =>
            <div key={ws.spaceKey} className='workspace'>
              <div className='workspace-name'>{ws.projectName}</div>
              <div className='workspace-action'>
                <a className='btn btn-default' href={'#spaceKey=' + ws.spaceKey} onClick={e => openWorkspace(ws)}>Open</a>
                <button className='btn btn-danger' style={{marginLeft: '4px'}}
                  onClick={e => deleteWorkspace(ws.spaceKey)}>Delete</button>
              </div>
            </div>
          ) }
        </div>
      </div>
    )
  }
}

WorkspaceList = connect(
  state => state.WorkspaceState,
  dispatch => bindActionCreators(WorkspaceActions, dispatch)
)(WorkspaceList)

export default WorkspaceList
