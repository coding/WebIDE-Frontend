import React, { Component } from 'react'
import { connect } from 'react-redux'
import { initializeFileTree } from '../components/FileTree/actions'
import PanelsContainer from '../components/Panel'
import Utilities from './Utilities'
import hasVimium from 'utils/hasVimium'
import { notify, NOTIFY_TYPE } from '../components/Notification/actions'
import i18n from 'utils/createI18n'
import GlobalPrompt from './GlobalPrompt'
import config from 'config';
import { autorun } from 'mobx';
import VirtualKey from '../components/VirtualKey'

class IDE extends Component {
  constructor (props) {
    super(props)
    this.state = { isReady: false }
  }

  componentWillMount () {  // initLifecycle_3: IDE specific init
    initializeFileTree() // @fixme: this is related to the quirk in filetree state
    this.setState({ isReady: true })
  }

  componentDidMount () {
    if (hasVimium()) {
      notify({
        notifyType: NOTIFY_TYPE.ERROR,
        message: i18n`global.hasVimium`,
        dismissAfter: 12000
      })
    }
  }

  render () {
    if (!this.state.isReady) return null
    return (
      <div className='ide-container'>
        <GlobalPrompt />
        <PanelsContainer />
        <Utilities />
        {config.isPad && <VirtualKey />}
      </div>
    )
  }
}

export default connect()(IDE)
