import React from 'react'
import i18n from 'utils/createI18n'

const Form = (props) => {
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
        <button className='btn btn-primary'
          disabled={content.buttonDisabled}
          onClick={() => {
            if (content.okCallback) {
              content.okCallback()
            }
            meta.resolve(true)
          }}
        >{content.okText || i18n`modal.okButton`}</button>
        <button className='btn btn-default' onClick={() => meta.resolve(false)}>
          {i18n`modal.cancelButton`}
        </button>
      </div>
    </div>
  )
}

export default Form
