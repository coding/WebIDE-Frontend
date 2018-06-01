import React, { Component } from 'react'
import { dispatchCommand } from 'commands'
import config from 'config'
import { supportLangServer } from 'components/MonacoEditor/utils/languages'
import LanguageStae from 'components/Tab/LanguageClientState'
import { createLanguageClient } from 'components/MonacoEditor/actions'

class LanguageServerConfig extends Component {
  state = {
    language: config.mainLanguage
  }

  handleChangeMainlanguage = (e) => {
    this.setState({ language: e.target.value })
  }

  handleCommit = () => {
    const client = LanguageStae.clients.get(config.mainLanguage)
    if (client) {
      client.destory()
    }
    config.mainLanguage = this.state.language
    createLanguageClient(this.state.language)
    dispatchCommand('modal:dismiss')
  }

  render () {
    const { language } = this.state
    return (<div>
      <h2>语言服务器设置</h2>
      <div className='form-group'>
        <label>项目语言</label>
        <select className='form-control' onChange={this.handleChangeMainlanguage} value={language}>
          <option key='plane text' value=''>plane text</option>
          {supportLangServer.map(l =>
            <option key={l.lang} value={l.lang}>{l.lang}</option>)}
        </select>
      </div>
      <div className="modal-ops settings-content-controls">
        <button className="btn btn-default" onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
        <button className="btn btn-primary" onClick={this.handleCommit}>Commit</button>
      </div>
    </div>)
  }
}

export default LanguageServerConfig
