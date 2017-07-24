import React, { Component } from 'react'
import { connect } from 'react-redux'
import { dispatchCommand } from '../../../commands'
import * as GitActions from '../actions'

@connect(state => state.GitState)
class GitTagView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tagName: '',
      commit: 'HEAD',
      message: '',
      force: false,
      forceDisabled: true,
      errMsg: ''
    }
    this.handleForceChange = this.handleForceChange.bind(this)
    this.handleTagNameChange = this.handleTagNameChange.bind(this)
  }

  render () {
    const { branches: {current: currentBranch}, dispatch, tags } = this.props
    let checked = this.state.force
    if (this.state.forceDisabled) {
      checked = false
    }
    return (
      <div>
        <div className='git-tag-container'>
          <h1>{i18n`git.tag.title`}</h1>
          <hr />
          <form className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-3 control-label">{i18n`git.tag.currentBranch`}</label>
              <label className="col-sm-9 checkbox-inline">{currentBranch}</label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">{i18n`git.tag.tagName`}</label>
              <label className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={this.state.tagName}
                  onChange={this.handleTagNameChange}
                  onKeyDown={e => {if (e.keyCode === 13) {
                    e.preventDefault()
                    this.addTag()
                  }}}
                />
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label"></label>
              <label className="col-sm-9">
                <input type="checkbox"
                  onChange={this.handleForceChange}
                  checked={checked}
                  disabled={this.state.forceDisabled}
                />
                {i18n`git.tag.force`}
                <span className='error-info'>
                {this.state.errMsg}
                </span>
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">{i18n`git.tag.commit`}</label>
              <label className="col-sm-9">
                <input type="text"
                  className="form-control"
                  value={this.state.commit}
                  onChange={e => this.setState({commit: e.target.value})} />
              </label>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">{i18n`git.tag.message`}</label>
              <label className="col-sm-9">
                <textarea type="text"
                  className="form-control"
                  value={this.state.message}
                  placeholder={i18n.get('git.tag.optional')}
                  onChange={e => this.setState({message: e.target.value})}
                  onKeyDown={e => {if ((e.metaKey || e.ctrlKey) && e.keyCode === 13) {
                    e.preventDefault()
                    this.addTag()
                  }}}
                />
              </label>
            </div>
          </form>
          <hr />
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={e => dispatchCommand('modal:dismiss')}>{i18n`git.cancel`}</button>
            <button className='btn btn-primary'
              onClick={e => this.addTag()}
              disabled={!this.state.commit || !this.state.tagName || !(
                this.state.forceDisabled || (!this.state.forceDisabled && this.state.force)
              )}>{i18n`git.commit`}</button>
          </div>
        </div>
      </div>
    )
  }

  addTag () {
    if (!this.state.commit || !this.state.tagName) return
    this.props.dispatch(GitActions.addTag({
      tagName: this.state.tagName,
      ref: this.state.commit,
      message: this.state.message,
      force: this.state.force
    }))
  }

  handleTagNameChange (e) {
    const tagName = e.target.value
    let forceDisabled = true
    let errMsg = ''
    if (this.props.tags.indexOf(tagName) > -1) {
      forceDisabled = false
      errMsg = i18n.get('git.tag.errMsg')
    }
    this.setState({
      tagName,
      forceDisabled,
      errMsg
    })
  }

  handleForceChange (e) {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const force = e.target.checked
    let errMsg = ''
    if (!force) {
      errMsg = i18n.get('git.tag.errMsg')
    }
    this.setState({
      force,
      errMsg
    })
  }
}

export default GitTagView
