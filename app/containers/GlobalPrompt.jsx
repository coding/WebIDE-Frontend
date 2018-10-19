import React, { Component } from 'react'

import Prompt from 'components/Prompt/Prompt'
import { browserDetect } from 'utils'
import config from 'config'
import i18n from 'utils/createI18n'

class GlobalPrompt extends Component {
  constructor (props) {
    super(props)
    this.state = {
      prompts: []
    }
  }

  componentDidMount () {
    let id = 0
    const browserVersion = browserDetect()
    const promptMessage = []
    const { prompts } = this.state

    // promptMessage.push({
    //   content: (
    //     <p>
    //       Cloud Studio 将于 9 月 6 日 19 点进行系统维护，预计时间为 30 分钟，敬请谅解。
    //     </p>
    //   ),
    //   id: `global-prompt-${id++}`,
    //   type: 'update'
    // })

    // if (!localStorage.getItem('visited')) {
    promptMessage.push({
      content: (
        <p>
          Cloud Studio 已在腾讯云开发者平台中全面升级，升级后您可以获得更好体验，详情参见{' '}
          <a href='/export' target='_blank' rel='noopener noreferrer'>
          这里
          </a>{' '}
        </p>
      ),
      id: `global-prompt-${id++}`,
      type: 'update'
    })
    // }

    if (browserVersion !== 'Chrome' && browserVersion !== 'Safari') {
      promptMessage.push({
        content: (
          <p>
            检测到您的浏览器为 {browserVersion}，为保障用户体验，推荐使用 Chrome 或 Safari
            浏览器访问。
          </p>
        ),
        id: `global-prompt-${id++}`,
        type: 'compatibility'
      })
    }
    if (config.willExpire) {
      promptMessage.push({
        content: (
          // <p>
          //   {i18n`global.machineOutofDateSoon`}
          //   <span className='important'>{i18n`global.outofDateSoon`}</span>
          //   {i18n`global.machineOutofDateSoon2`}
          //   <a href='https://console.cloud.tencent.com/lighthosting' target='_blank' rel='noopener noreferrer'>{i18n`global.renewals`}</a>
          //   {i18n`global.and`}
          //   <a href='https://dnspod.cloud.tencent.com/act/coding' target='_blank' rel='noopener noreferrer' >{i18n`global.actHint`}</a>
          // </p>
          <p>
            {i18n`global.offlineInfo`}
            <a href='https://ide.coding.net' rel='noopener noreferrer'>{i18n`global.gotoIDE`}</a>
          </p>
        ),
        id: `global-prompt-${id++}`,
        type: 'compatibility'
      })
    }

    this.setState({
      prompts: [...prompts, ...promptMessage]
    })
  }

  handleClosePrompt = (id, type) => {
    const { prompts } = this.state
    this.setState({ prompts: prompts.filter(prompt => prompt.id !== id) })
    if (type === 'update') {
      localStorage.setItem('visited', true)
    }
  }

  render () {
    const { prompts } = this.state
    return <Prompt prompts={prompts} handleClose={this.handleClosePrompt} />
  }
}

export default GlobalPrompt
