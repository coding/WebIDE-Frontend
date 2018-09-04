import React, { Component } from 'react'
import Remarkable from 'remarkable'
import md from '../../../static/changelog/changelog.md'

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
  <div className='changelog-page' dangerouslySetInnerHTML={{ __html: remarkable.render(md) }}></div>
)

export default Changelog
