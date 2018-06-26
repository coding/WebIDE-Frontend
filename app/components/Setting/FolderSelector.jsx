import React from 'react'
import PropTypes from 'prop-types'
import { addModal, dismissModal } from 'components/Modal/actions'
import { trim } from 'lodash'

export default class FolderSelector extends React.PureComponent {
  static propTypes = {
    onChange: PropTypes.func
  }

  handleSelectSource = () => {
    addModal('FileSelectorView', {
      title: 'Select a folder',
      onlyDir: true,
    }).then((node) => {
      if (!node) return
      const { onChange } = this.props
      const path = trim(node.path, '/')
      onChange(`/${path}`)
      dismissModal()
    })
  }

  render () {
    return <i className='fa fa-folder-o' onClick={this.handleSelectSource} />
  }
}
