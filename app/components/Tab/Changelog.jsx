import React, { Component } from 'react'
import marked from 'marked'
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
