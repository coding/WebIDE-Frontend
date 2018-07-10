import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import styled from 'styled-components'

const Label = styled.span`
  height: 100%;
  flex: 1;
  cursor: pointer;
  width: 100%;
`

const SingleFileNode = ({ item, toggleStaging, handleClick, active }) => (
  <div className={cx('filetree-node filetree-node-container', { 'active': !!active })}>
    <span
      className='filetree-node-checkbox'
      onClick={e => toggleStaging(item)}
    >
      <i className={cx('fa', {
        'fa-check-square': !item.isDir && item.isStaged,
        'fa-square-o': !item.isDir && !item.isStaged
      })}
      />
    </span>
    <span className='filetree-node-icon'>
      <i className={cx('fa file-status-indicator', item.status.toLowerCase(), {
        'fa-folder-o': item.isDir,
        'fa-pencil-square': item.status === 'MODIFIED' || item.status === 'CHANGED' || item.status === 'MODIFY',
        'fa-plus-square': item.status === 'UNTRACKED' || item.status === 'ADD',
        'fa-minus-square': item.status === 'MISSING',
        'fa-exclamation-circle': item.status === 'CONFLICTION'
      })}
      />
    </span>
    <Label onClick={() => handleClick(item.path)}>
      {item.path}
    </Label>
  </div>
)

class CommitFileList extends PureComponent {
  static propTypes = {
    statusFiles: PropTypes.object,
    toggleStaging: PropTypes.func,
    handleClick: PropTypes.func,
    active: PropTypes.string
  }

  render () {
    const { statusFiles, toggleStaging, handleClick, active } = this.props
    const unStagedFiles = statusFiles.filter(v => !v.isDir).toArray()

    return (
      <div className='git-commit-files git-filetree-container'>
        {unStagedFiles.map(item => (<SingleFileNode
          item={item}
          key={item.path}
          active={active === item.path}
          toggleStaging={toggleStaging}
          handleClick={handleClick}
        />))}
      </div>
    )
  }
}

export default CommitFileList
