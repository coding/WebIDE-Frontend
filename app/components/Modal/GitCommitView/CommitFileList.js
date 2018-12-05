import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import styled from 'styled-components'
import i18n from 'utils/createI18n'

const Label = styled.span`
  height: 100%;
  flex: 1;
  cursor: pointer;
  width: 100%;
`

const SingleFileNode = ({ item, toggleStaging, handleClick, active }) => (
  <div className={cx('filetree-node filetree-node-container', { active: !!active })}>
    <span className='filetree-node-checkbox' onClick={e => toggleStaging(item)}>
      <i className={`fa ${!item.isStaged ? 'fa-square-o' : 'fa-check-square'}`}></i>
    </span>
    <span className='filetree-node-icon'>
      <i
        className={cx('file-status-indicator fa', item.status.toLowerCase(), {
          'fa-folder-o': item.isDir,
          'fa-pencil-square': item.status === 'MODIFIED' || item.status === 'CHANGED' || item.status === 'MODIFY',
          'fa-plus-square': item.status === 'UNTRACKED' || item.status === 'ADD',
          'fa-minus-square': item.status === 'MISSING',
          'fa-exclamation-circle': item.status === 'CONFLICTION'
        })}
      />
    </span>
    <Label onClick={() => handleClick(item.path)}>{item.path}</Label>
  </div>
)

SingleFileNode.propTypes = {
  item: PropTypes.object,
  toggleStaging: PropTypes.func,
  handleClick: PropTypes.func,
  active: PropTypes.bool
}

class CommitFileList extends PureComponent {
  static propTypes = {
    statusFiles: PropTypes.object,
    toggleStagingAll: PropTypes.func,
    toggleStaging: PropTypes.func,
    handleClick: PropTypes.func,
    active: PropTypes.string
  }

  render () {
    const { statusFiles, toggleStagingAll, toggleStaging, handleClick, active } = this.props
    const unStagedFiles = statusFiles.filter(v => !v.isDir).toArray();
    const allStaged = unStagedFiles.every(v => v.isStaged);
    return (
      <div className='git-commit-files git-filetree-container'>
        {unStagedFiles.length > 1 && (
          <div className="checkbox-all" onClick={toggleStagingAll}>
            <i className={`fa ${!allStaged ? 'fa-square-o' : 'fa-check-square'}`}></i>
            <span className="label">{i18n`git.commitView.all`}</span>
          </div>
        )}
        {unStagedFiles.map(item => (
          <SingleFileNode
            item={item}
            key={item.path}
            active={active === item.path}
            toggleStaging={toggleStaging}
            handleClick={handleClick}
          />
        ))}
      </div>
    )
  }
}

export default CommitFileList
