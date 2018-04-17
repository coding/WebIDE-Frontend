import React, { Component } from 'react'

import Prompt from 'components/Prompt/Prompt'

class GlobalPrompt extends Component {
  constructor (props) {
    super(props)
    this.state = {
      prompts: []
    }
  }

  componentDidMount () {
    const id = 'global-prompt-ide'
    const promptMessage = []

    if (!localStorage.getItem('visited')) {
      promptMessage.push({
        content: (
          <p>
            WebIDE 现已全面升级为 Cloud Studio，点击
            <a
              href='https://studio.coding.net'
              target='_blank'
              rel='noopener noreferrer'
              onClick={() => this.handleClosePrompt(id, 'update')}
            >
              立即体验
            </a>{' '}
          </p>
        ),
        id: 'global-prompt-ide',
        type: 'update'
      })
      this.setState({ prompts: promptMessage })
    }
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
