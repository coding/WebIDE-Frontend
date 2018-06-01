import React, { Component } from 'react'
import { connect } from 'react-redux'
import { initializeFileTree } from '../components/FileTree/actions'
import PanelsContainer from '../components/Panel'
import Utilities from './Utilities'
import hasVimium from 'utils/hasVimium'
import emitter, { STORAGE_CHANGE } from 'utils/emitter'
import { notify, NOTIFY_TYPE } from '../components/Notification/actions'
import i18n from 'utils/createI18n'
import GlobalPrompt from './GlobalPrompt'

class IDE extends Component {
  constructor (props) {
    super(props)
    this.state = { isReady: false }
  }

  componentWillMount () {  // initLifecycle_3: IDE specific init
    initializeFileTree() // @fixme: this is related to the quirk in filetree state
    this.setState({ isReady: true })
    if (!localStorage.getItem('enableNewEditor')) {
      localStorage.setItem('enableNewEditor', false)
    }
    emitter.on(STORAGE_CHANGE, () => {
      window.location.reload()
    })
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
      </div>
    )
  }
}

export default connect()(IDE)
