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

const Bulletin = ({ close }) => {
  return (
    <div className="ide-bulletin">
      <span>{i18n`global.eventStreamBulletin1`}</span>
      <a href="https://mp.weixin.qq.com/s/IaOWxG0XLvn2znvvP1dmwA" target="_blank">{i18n`global.eventStreamBulletin2`}</a>
      <span>{i18n`global.eventStreamBulletin3`}</span>
      <i className="fa fa-remove" onClick={close}></i>
    </div>
  );
}

class IDE extends Component {
  constructor (props) {
    super(props)
    this.state = { isReady: false, isBulletinOn: true }
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
        {this.state.isBulletinOn && <Bulletin close={this.closeBulletin} />}
        <GlobalPrompt />
        <PanelsContainer />
        <Utilities />
      </div>
    )
  }

  closeBulletin = () => {
    this.setState({ isBulletinOn: false });
  }
}

export default connect()(IDE)
