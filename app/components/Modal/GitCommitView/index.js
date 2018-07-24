import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import styled from 'styled-components'

import * as GitActions from 'components/Git/actions'
import i18n from 'utils/createI18n'
import { dispatchCommand } from 'commands'
import { extensions } from 'components/MonacoEditor/utils/modeInfos'
import CommitFileList from './CommitFileList'
import DiffView from './DiffView'

/* eslint-disable */
const jsdiff = require('diff')
/* eslint-enable */

const Container = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

class GitCommitView extends PureComponent {
  static propTypes = {
    isWorkingDirClean: PropTypes.bool,
    updateCommitMessage: PropTypes.func,
    commit: PropTypes.func,
    statusFiles: PropTypes.object,
    toggleStaging: PropTypes.func,
    gitFileDiff: PropTypes.func,
    gitReadFile: PropTypes.func,
    readFile: PropTypes.func
  }

  state = {
    loading: false,
    original: '',
    modified: '',
    path: ''
  }

  componentDidMount () {
    const { statusFiles } = this.props
    const firstNode = statusFiles.filter(v => !v.isDir).toArray()[0]
    if (firstNode) {
      this.handleClickFile(firstNode.path)
    }
  }

  handleClickFile = (filePath) => {
    const { gitFileDiff, gitReadFile, readFile } = this.props
    const { path } = this.state

    const extension = `.${filePath.split('.').pop()}`

    this.setState({ path: filePath })
    if (path !== filePath) {
      if (extensions.includes(extension)) {
        this.setState({ unknowFile: false })
        const newRef = 'HEAD'
        const oldRef = '~~unstaged~~'
        this.setState({ loading: true, original: '', modified: '' })
        gitFileDiff({ path: filePath, newRef, oldRef }).then((res) => {
          const diffPatch = res.diff
          if (diffPatch === '' || diffPatch.split('\n')[3] === '--- /dev/null') {
            gitReadFile({ ref: newRef, path: filePath }).then((gitRes) => {
              this.showDiffView(gitRes.content, '', filePath)
            })
          } else if (oldRef && oldRef !== '~~unstaged~~') {
            gitReadFile({ ref: oldRef, path: filePath }).then((gitRes) => {
              const original = gitRes.content
              const modified = jsdiff.applyPatch(original, diffPatch)
              this.showDiffView(original, modified, filePath)
            })
          } else {
            readFile({ path: filePath }).then((fileRes) => {
              const modified = fileRes.content
              const original = jsdiff.applyPatch(modified, diffPatch)
              this.showDiffView(original, modified, filePath)
            })
          }
        })
      } else {
        this.setState({ unknowFile: true })
      }
    }
  }

  showDiffView = (original, modified, path) => {
    this.setState({
      loading: false,
      original,
      modified,
      path
    })
  }

  render () {
    const {
      isWorkingDirClean,
      updateCommitMessage,
      commit,
      statusFiles,
      toggleStaging
    } = this.props
    const { loading, original, modified, path, unknowFile } = this.state
    const initialCommitMessage = i18n.get('git.commitView.initMessage')
    return isWorkingDirClean ? (
      <h1 className=''>{i18n`git.commitView.nothingCommit`}</h1>
    ) : (
      <div className='git-commit-container'>
        <div className='git-commit-body'>
          <CommitFileList
            active={path}
            statusFiles={statusFiles}
            toggleStaging={toggleStaging}
            handleClick={this.handleClickFile}
          />
          {unknowFile && <Container>{i18n`git.commitView.nnableToPreview`}</Container>}
          {!unknowFile &&
            (loading ? (
              <Container className='loading'>
                <i className='fa fa-spinner fa-spin' />
              </Container>
            ) : (
              <DiffView original={original} modified={modified} path={path} />
            ))}
        </div>
        <hr />
        <div className='git-commit-footer'>
          <div className='git-commit-message-container'>
            <textarea
              name='git-commit-message'
              id='git-commit-message'
              rows='4'
              placeholder={initialCommitMessage}
              onChange={e => updateCommitMessage(e.target.value)}
              onKeyDown={e => (e.metaKey || e.ctrlKey) && e.keyCode === 13 && commit()}
            />
          </div>
          <hr />
          <div className='modal-ops'>
            <button
              className='btn btn-default'
              onClick={e => dispatchCommand('modal:dismiss')}
            >{i18n`git.cancel`}</button>
            <button className='btn btn-primary' onClick={e => commit()}>{i18n`git.commit`}</button>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitCommitView)
