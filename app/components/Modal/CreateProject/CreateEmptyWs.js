import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import i18n from 'utils/createI18n'

class CreateEmptyWs extends PureComponent {

  static propTypes = {
    submit: PropTypes.func,
    projectName: PropTypes.string,
    onChange: PropTypes.func,
  }

  onKeyDown = (e) => {
    if (e.keyCode === 108 || e.keyCode === 13) {
      this.props.submit()
    }
  }

  render () {
    const { projectName, onChange } = this.props
    return (
      <div>
        <p className='message'>{i18n`project.emptyHeader`}</p>
        <input type='text'
          className='form-control'
          // ref={r => this.input = r}
          onChange={onChange}
          onKeyDown={this.onKeyDown}
          value={projectName}
          placeholder={i18n.get('project.wsPlaceholder')}
          autoFocus
        />
      </div>
    )
  }
}

export default CreateEmptyWs
