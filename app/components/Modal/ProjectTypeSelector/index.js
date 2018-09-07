import React, { PureComponent } from 'react'
import { capitalize } from 'lodash'
import settings from 'settings'
import config from 'config'

import { setLanguageServerOne } from 'backendAPI/languageServerAPI'
import { dismissModal } from 'components/Modal/actions'

class ProjectTypeSelector extends PureComponent {
  handleClick = (data) => {
    const { type, srcPath } = data
    config.mainLanguage = capitalize(type)
    settings.languageserver.projectType.value = capitalize(type)
    settings.languageserver.sourcePath.value = srcPath
    setLanguageServerOne(data)
    dismissModal()
  }

  render () {
    const { data } = this.props
    return (
      <div className='modal-content'>
        <h2>选择项目类型</h2>
        {data.map(v => (
          <div className='project-type-item' key={`${v.type}${v.srcPath}`} onClick={() => this.handleClick(v)}>
            <p className='project-type'>{v.type}</p>
            <p className='project-src'>{v.srcPath}</p>
          </div>
        ))}
      </div>
    )
  }
}

export default ProjectTypeSelector
