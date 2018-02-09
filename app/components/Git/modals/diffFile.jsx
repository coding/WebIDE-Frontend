import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'
import { inject, observer } from 'mobx-react'
import * as GitActions from '../actions'
const jsdiff = require('diff')

// CodeMirror
import CodeMirror from 'codemirror'
require(['diff_match_patch'], (lib) => {
  Object.assign(window, lib)  // @fixme: diff_match_patch is now exposed into the global ns
  require(['codemirror/addon/merge/merge.js'])
})
import 'codemirror/addon/merge/merge.css'

@inject(state => ({
  themeName: state.SettingState.settings.appearance.syntax_theme.value,
}))
class GitDiffView extends Component {
  static defaultProps = {
    mode: null,
    height: '100%',
    width: '100%',
  }

  constructor (props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }

  componentWillMount () {
    const { path, oldRef, newRef } = this.props.content
    if (oldRef !== '') {
      this.props.gitFileDiff({
        path,
        oldRef,
        newRef
      }).then((res) => {
        this.setState({
          isLoading: false,
        })
        const diffPatch = res.diff
        if (diffPatch === '' || diffPatch.split('\n')[3] === '--- /dev/null') {
          this.props.gitReadFile({ ref: newRef, path })
            .then((res) => {
              this.initDiff('', res.content)
            })
        } else if (oldRef && oldRef !== '~~unstaged~~') {
          this.props.gitReadFile({ ref: oldRef, path })
            .then((res) => {
              const content = res.content
              const newContent = jsdiff.applyPatch(content, diffPatch)
              this.initDiff(newContent, content)
            })
        } else {
          this.props.readFile({ path })
            .then((res) => {
              const content = res.content
              const newContent = jsdiff.applyPatch(content, diffPatch)
              this.initDiff(newContent, content)
            })
        }
      })
    } else {
      this.props.gitReadFile({ ref: newRef, path })
        .then((res) => {
          this.initDiff('', res.content)
        })
    }
  }

  render () {
    const { content } = this.props
    const { path, oldRef, newRef } = this.props.content
    let loadDiv = ''
    if (this.state.isLoading) {
      loadDiv = (
        <div className='loading'>
          <i className='fa fa-spinner fa-spin' />
        </div>
      )
    } else {
      loadDiv = ''
    }
    let title = ''
    if (oldRef !== '') {
      title = i18n`git.diffFileModal.titleWithOldRef${{ path, newRef, oldRef }}`
    } else {
      title = i18n`git.diffFileModal.title${{ path }}`
    }
    return (
      <div>
        <div className='git-merge'>
          <h1>
            {title}
          </h1>
          <hr />
          <div className='diffModal'>
            <div
              id='flex-container'
              className='diffContainer'
            >
              <div id='cm-merge-view-wrapper' ref={r => this.editorDOM = r} />
            </div>
            { loadDiv }
          </div>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>{i18n`git.cancel`}</button>
          </div>
        </div>
      </div>
    )
  }

  initDiff (left, right) {
    this.mergeView = CodeMirror.MergeView(this.editorDOM, {
      origLeft: left,
      value: right,
      lineNumbers: true,
      theme: this.props.themeName,
      // revertButtons: true,
      readOnly: true
    })
    this.mergeView.wrap.style.height = '100%'
  }
}

export default GitDiffView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitDiffView)
