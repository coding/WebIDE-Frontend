import React, { Component } from 'react'
import md from '../../../static/changelog/changelog.md'

const style = {
  textAlign: 'left',
  marginTop: '2em'
}

const Changelog = () => (
  <div dangerouslySetInnerHTML={{ __html: marked(md) }}
    className='welcome-page' style={style}
  >
  </div>
)

export default Changelog
