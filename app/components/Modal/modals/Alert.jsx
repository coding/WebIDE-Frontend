import React from 'react'

const Alert = (props) => {
  const { meta, content } = props
  return (
    <div className='modal-content'>
      { content.header ?
        <div className='header'>{content.header}</div>
      : null }

      { content.message ?
        <div className='message'>{content.message}</div>
      : null }

      { content.statusMessage ?
        <div className='message'>{content.statusMessage}</div>
      : null }

      <div className='footer modal-ops'>
        <button className='btn btn-primary' onClick={e => meta.resolve(true)}>{content.okText || 'OK'}</button>
      </div>
    </div>
  )
}

export default Alert
