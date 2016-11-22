/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { dispatchCommand } from '../../../commands'
import cx from 'classnames'
import { connect } from 'react-redux'

import * as GitActions from '../actions'
import AceMerge from '../ace-merge'
import getMode from '../../AceEditor/getAceMode';
import 'brace/theme/github';
import 'brace/theme/monokai';

class GitMergeView extends Component {
  static defaultProps = {
    theme: 'ace/theme/monokai',//'monokai',
    mode: null,
    height: '100%',
    width: '100%',
  }

  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
    }
    this.handleConfirm = this.handleConfirm.bind(this)
  }

  componentWillMount () {
    this.props.getConflicts({path: this.props.content.file.name}).then(res => {
      this.setState({
        isLoading: false,
        // mode: `ace/mode/${getMode(this.props.content.file.name)}`
      })
      this.initMerge(res)
    })
  }

  render () {
    const {theme, content} = this.props;
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
    return (
      <div>
        <div className='git-merge'>
          <h1>
          Conflicts List
          </h1>
          <hr />
          <div className='diffModal'>
            <div className='mergeTitle'>
              <div>
                LOCAL
              </div>
              <div className='gutterTitle'></div>
              <div>
                BASE
              </div>
              <div className='gutterTitle'></div>
              <div>
                REMOTE
              </div>
            </div>
            <div
              id='flex-container'
              className='mergeContainer'>
              <div key='leftEditor'>
                <div id='editor1'></div>
              </div>
              <div
                id='gutterLeft'
                key='gutterLeft'>
              </div>
              <div key='middleEditor'>
                <div id='editor3'></div>
              </div>
              <div
                id='gutterRight'
                key='gutterRight'>
              </div>
              <div key='rightEditor'>
                <div id='editor2'></div>
              </div>
            </div>
            { loadDiv }
          </div>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>Cancel</button>
            <button className='btn btn-primary' onClick={this.handleConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    )
  }

  initMerge (data) {
    var that = this
    require([`brace/mode/${getMode(that.props.content.file.name)}`], () => {
      that.aceMerge = new AceMerge({
        // mode: this.state.mode,
        mode: `ace/mode/${getMode(that.props.content.file.name)}`,
        left: {
          id: "editor1",
          content: data.local,
          theme: that.state.theme,
          editable: false
        },
        middle: {
          id: "editor3",
          content: data.base,
          theme: that.state.theme,
          copyLinkEnabled: false
        },
        right: {
          id: "editor2",
          content: data.remote,
          theme: that.state.theme,
          editable: false
        },
        classes: {
          gutterLeftID: "gutterLeft",
          gutterRightID: "gutterRight"
        }
      })
    })
    
  }

  handleConfirm () {
    let content = this.aceMerge.editors.middle.ace.getValue()
    this.props.resolveConflict({
      path: this.props.content.file.name,
      content
    })
  }
}

export default GitMergeView = connect(
  state => state.GitState,
  dispatch => bindActionCreators(GitActions, dispatch)
)(GitMergeView)
