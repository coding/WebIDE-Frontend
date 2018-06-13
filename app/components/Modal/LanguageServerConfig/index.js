import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { trim } from 'lodash'
import { dispatchCommand } from 'commands'
import config from 'config'
import { addModal } from 'components/Modal/actions'
import i18n from 'utils/createI18n'
import { supportLangServer } from 'components/MonacoEditor/utils/languages'
import LanguageState from 'components/Tab/LanguageClientState'
import { createLanguageClient } from 'components/MonacoEditor/actions'

@observer
class LanguageServerConfig extends Component {
  state = {
    language: config.mainLanguage,
    path: config._WORKSPACE_SUB_FOLDER_,
  }

  handleSourceChange = (e) => {
    this.setState({
      path: e.target.value
    })
  }

  handleChangeMainlanguage = (e) => {
    this.setState({
      language: e.target.value
    })
  }

  handleSelectSource = () => {
    addModal('FileSelectorView', {
      title: 'Select a folder',
      onlyDir: true,
    }).then((node) => {
      if (!node) return
      const path = trim(node.path, '/')
      this.setState({ path })
      dispatchCommand('modal:dismiss')
    })
  }

  handleCommit = () => {
    const client = LanguageState.clients.get(config.mainLanguage)
    if (client) {
      client.destory()
    }
    window.localStorage.setItem(`${config.spaceKey}-mainLanguage`, this.state.language)
    window.localStorage.setItem(`${config.spaceKey}-_WORKSPACE_SUB_FOLDER_`, this.state.path)
    config._WORKSPACE_SUB_FOLDER_ = this.state.path
    config._ROOT_URI_ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir/${config._WORKSPACE_SUB_FOLDER_}`
    config.mainLanguage = this.state.language
    createLanguageClient(this.state.language)
    dispatchCommand('modal:dismiss')
  }

  render () {
    return (<div className='project-config-container'>
      <h2>{i18n`menuBarItems.file.lspSettings`}</h2>
      <div className='form-group'>
        <label>{i18n`modal.projectType`}</label>
        <select className='form-control' onChange={this.handleChangeMainlanguage} value={this.state.language}>
          <option key='plane text' value=''>Blank</option>
          {supportLangServer.map(l =>
            <option key={l.lang} value={l.lang}>{l.lang}</option>)}
        </select>
      </div>
      <div className='form-group'>
        <label>{i18n`modal.sourceFolder`}</label>
        <div className='form-line'>
          <input className='form-control'
            type='text'
            onChange={this.handleSourceChange}
            placeholder='e.g. src/main/java'
            value={this.state.path}
          />
          <i className='fa fa-folder-o' onClick={this.handleSelectSource} />
        </div>
      </div>
      <div className='modal-ops settings-content-controls'>
        <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
        <button className='btn btn-primary' onClick={this.handleCommit}>Commit</button>
      </div>
    </div>)
  }
}

export default LanguageServerConfig
