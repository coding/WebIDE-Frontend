import React, { Component } from 'react'
import { trim } from 'lodash'
import { dispatchCommand } from 'commands'
import config from 'config'
import { addModal } from 'components/Modal/actions'
import FormInputGroup from './FormInputGroup'

class LanguageServerSetting extends Component {

  state = {
    path: config._WORKSPACE_SUB_FOLDER_,
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

  render () {
    const { header, content } = this.props
    return (
      <div>
        <h2 className='settings-content-header'>{header}</h2>
        <div>
          {content.items.map(settingItem =>
            <FormInputGroup
              key={settingItem.key}
              settingItem={settingItem}
              requireConfirm={content.requireConfirm}
            />
          )}
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
        </div>
      </div>
    )
  }
}

export default LanguageServerSetting
