import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Prompts extends Component {
  render () {
    const { prompts, handleClose } = this.props
    return (
      <div className='prompt-container'>
        {prompts.map((prompt, idx) => (
          <div
            className='browser-prompt'
            key={prompt.id}
            style={{ animationDelay: `${idx * 0.2}s` }}
          >
            {prompt.content}
            <i className='btn close' onClick={() => handleClose(prompt.id)}>×</i>
          </div>
        ))}
      </div>
    )
  }
}

Prompts.propTypes = {
  prompts: PropTypes.array,
  handleClose: PropTypes.func,
}

export default Prompts
