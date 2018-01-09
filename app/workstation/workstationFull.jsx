import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Root from '../containers/Root'
import initialize from './initialize'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import cx from 'classnames'
import '../styles/workstation.styl'
// import initialize from '../initialize'
// import InitializeContainer from '../containers/Initialize'
// import '../styles/lib.styl'
import '../styles/dark/index.styl'
import './styles/workstation.styl'
import config from '../config'
import initializeState from '../containers/Initialize/state'
import TerminalContainer from '../components/Terminal'
import { emitter, E } from 'utils'

@observer
class WorkStation extends Component {
  constructor (props) {
    super(props)
    this.state = observable({
      allSuccess: false,
      size: 'min',
    })
    this.handleMin = this.handleMin.bind(this)
    this.handleRestore = this.handleRestore.bind(this)
    this.handleMax = this.handleMax.bind(this)
    this.handleHide = this.handleHide.bind(this)
  }
  componentWillMount () {
  }
  componentDidMount () {
    const that = this
    this.init = async function () {
      const step = await initialize({ persist: true })
      if (step.allSuccess) {
        that.state.allSuccess = true
      }
    }
    this.init()
  }
  render () {
    if (!this.state.allSuccess) {
      return (<div><i className='fa fa-spinner fa-pulse fa-fw' /> Loading...</div>)
    }
    const size = this.state.size

    return (
      <div className={cx('workstation', size)}>
        <Root />
        <div className='workstation-toolbar'>
          <i className='fa fa-window-minimize' onClick={this.handleMin} />
          <i className='fa fa-window-restore' onClick={this.handleRestore} />
          <i className='fa fa-window-maximize' onClick={this.handleMax} />
          <i className='fa fa-window-close-o' onClick={this.handleHide} />
        </div>
      </div>
    )
  }

  handleMin () {
    if (this.state.size !== 'min') {
      this.state.size = 'min'
      setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
    }
  }

  handleRestore () {
    if (this.state.size !== 'restore') {
      this.state.size = 'restore'
      setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
    }
  }

  handleMax () {
    if (this.state.size !== 'max') {
      this.state.size = 'max'
      setTimeout(() => emitter.emit(E.PANEL_RESIZED), 0)
    }
    // window.open(`http://ide.codelife.me:8000/ws/${config.spaceKey}`, '_blank')
  }

  handleHide () {
    this.state.size = 'hide'
  }
}

export default WorkStation
