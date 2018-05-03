import React, { Component } from 'react'

class EnvListSelector extends Component {
  render () {
    const { meta, content } = this.props
    return (
      <div>
        <div className='header'>{content.message}</div>
        <div className='model-content'>this is envlistselector</div>
        <div className='footer modal-ops'>
          <button className='btn btn-primary'>确定</button>
        </div>
      </div>
    )
  }
}

export default EnvListSelector
