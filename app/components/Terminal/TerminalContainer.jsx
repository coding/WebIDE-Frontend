import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
// import Terminal from './Terminal'
import Terminal from './Xterm'
import { Tab, TabGroup } from './state'
import { emitter, E } from 'utils'

import * as Actions from './actions'
import PluginArea from '../Plugins/component'
import { injectComponent } from '../Plugins/actions'
import { TERMINAL } from '../Plugins/constants'
import i18n from 'utils/createI18n'

const contextMenuItems = [
  {
    name: i18n`tab.contextMenu.close`,
    icon: '',
    command: 'tab:close'
  }, {
    name: i18n`tab.contextMenu.closeOthers`,
    icon: '',
    command: 'tab:close_other'
  }, {
    name: i18n`tab.contextMenu.closeAll`,
    icon: '',
    command: 'tab:close_all'
  }
]

@observer
class TerminalContainer extends Component {
  constructor (props) {
    super(props)
    this.afterInit = false;
    this.state = observable({
      showEnv: false,
      fullScreenActiveContent: false,
    })
    const tab = new Tab()
    this.tabGroup = new TabGroup({ id: 'terminalGroup' })
    this.tabGroup.addTab(tab)

    this.handleEnv = this.handleEnv.bind(this)
    this.onEnvHide = this.onEnvHide.bind(this)
  }

  componentDidMount () {
    // 帮助xterm判断是不是初始加载
    // xterm初始加载时不能聚焦
    this.afterInit = true;
    emitter.on(E.TERMINAL_SHOW, this.onShow)
    emitter.on(E.PANEL_HIDE, this.onHide)
    emitter.on(E.TERM_ENV_HIDE, this.onEnvHide)
    injectComponent(TERMINAL.ENV, {
      key: 'envController',
    }, () => <div></div>)
  }

  handleFullScreen = (value) => {
    const { fullScreenActiveContent } = this.state
    this.setState({
      fullScreenActiveContent: value || !fullScreenActiveContent
    })
  }

  componentWillUnmount () {
    emitter.removeListener(E.TERMINAL_SHOW, this.onShow)
    emitter.removeListener(E.PANEL_HIDE, this.onHide)
    emitter.removeListener(E.TERM_ENV_HIDE, this.onEnvHide)
  }

  render () {
    const { fullScreenActiveContent } = this.state
    return (
      <div className={cx('tab-container terminal-panel', { fullscreen: fullScreenActiveContent })}>
        <TabBar tabGroup={this.tabGroup}
          addTab={Actions.addTerminal}
          handleFullScreen={this.handleFullScreen}
          contextMenuItems={contextMenuItems}
        />
        <TabContent tabGroup={this.tabGroup} >
          {this.tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab} >
              <Terminal tab={tab} afterInit={this.afterInit} />
            </TabContentItem>
          )}
        </TabContent>
        {/*<div className='terminal-toolbar'>
          <i className='fa fa-desktop' onClick={this.handleEnv} />
        </div>
        <div className={cx('term-env', { hide: !this.state.showEnv })}>
          <PluginArea className='term-env-panel' position={TERMINAL.ENV} />
        </div>*/}
      </div>
    )
  }

  onShow () {
    Actions.openTerminal()
  }

  onHide (panel) {
  }

  onEnvHide () {
    this.state.showEnv = false
    // emitter.emit(E.TERM_ENV_HIDE)
  }

  handleEnv (e) {
    this.state.showEnv = !this.state.showEnv
    emitter.emit(E.TERM_ENV_SHOW, e)
    // if (this.state.showEnv) {
    //   emitter.emit(E.TERM_ENV_SHOW, e)
    // } else {
    //   emitter.emit(E.TERM_ENV_HIDE, e)
    // }
  }
}

export default TerminalContainer
