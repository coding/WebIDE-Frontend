import React, { Component } from 'react'
import { trim } from 'lodash'
import { dispatchCommand } from 'commands'
import config from 'config'
import { addModal } from 'components/Modal/actions'
import { supportLangServer } from 'components/MonacoEditor/utils/languages'
import LanguageStae from 'components/Tab/LanguageClientState'
import { createLanguageClient } from 'components/MonacoEditor/actions'

class LanguageServerConfig extends Component {
  state = {
    language: config.mainLanguage,
    path: '',
  }

  handleSourceChange = (e) => {
    this.setState({ path: e.target.value })
  }

  handleChangeMainlanguage = (e) => {
    this.setState({ language: e.target.value })
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
    const client = LanguageStae.clients.get(config.mainLanguage)
    if (client) {
      client.destory()
    }
    config._WORKSPACE_FOLDER_ = `${config._WORKSPACE_FOLDER_}/${this.state.path}`
    config.mainLanguage = this.state.language
    createLanguageClient(this.state.language)
    dispatchCommand('modal:dismiss')
  }

  render () {
    const { language } = this.state
    return (<div className='project-config-container'>
      <h2>语言服务器设置</h2>
      <div className='form-group'>
        <label>Project Type</label>
        <select className='form-control' onChange={this.handleChangeMainlanguage} value={language}>
          <option key='plane text' value=''>Blank</option>
          {supportLangServer.map(l =>
            <option key={l.lang} value={l.lang}>{l.lang}</option>)}
        </select>
      </div>
      <div className='form-group'>
        <label>Source Folder</label>
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
