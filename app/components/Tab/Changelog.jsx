import React, { Component } from 'react'
import Remarkable from 'remarkable'
import md from '../../../static/changelog/changelog.md'

const style = {
  textAlign: 'left',
  marginTop: '2em'
}

const remarkable = new Remarkable('full', {
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: 'language-',
  linkify: true,
  linkTarget: '_blank',
  typographer: false,
  quotes: '“”‘’',
})

const Changelog = () => (
  <div dangerouslySetInnerHTML={{ __html: remarkable.render(md) }}
    className='welcome-page' style={style}
  >
  </div>
)

export default Changelog
