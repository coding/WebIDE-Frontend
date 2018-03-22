import React, { Component } from 'react'
import { connect } from 'react-redux'
import { initializeFileTree } from '../components/FileTree/actions'
import PanelsContainer from '../components/Panel'
import Utilities from './Utilities'
import hasVimium from 'utils/hasVimium'
import { notify, NOTIFY_TYPE } from '../components/Notification/actions'
import i18n from 'utils/createI18n'

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
        <div className='workspace-list-header'>
          <div className='logo'></div>
          <div className='title'>插件研试平台</div>
          {/* <div className='user'>
            <div className='userAvator'>
              <div className='userAvatorImg'></div>
            </div>
            <div className='userName'>
              测试用户
            </div>
          </div> */}
        </div>
        <PanelsContainer />
        <Utilities />
      </div>
    )
  }
}

export default connect()(IDE)
