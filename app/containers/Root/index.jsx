/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'

import store from '../../store'
import IDE from '../IDE.jsx'
import WorkspaceList from '../../components/Workspace'
import ThemeProvider from '../../components/ThemeProvider'
import { initState } from './actions'


const codeTranslate = (language) => {
  const dic = {
    English: 'en_US',
    Chinese: 'zh_CN'
  }
  if (Array.isArray(language)) {
    console.log('here', language)
    const a = language.find(lan => {
      if (lan.includes('-')) lan = lan.replace(/-/g, '_')
      console.log('hrere', Object.keys(dic).map(e => dic[e]).includes(lan), lan)
      return Object.keys(dic).map(e => dic[e]).includes(lan)
    })
    console.log('12312313', a.replace(/-/g, '_'))
    return a.replace(/-/g, '_')
  }
  if (dic[language]) return dic[language]
  if (Object.keys(dic).map(e => dic[e]).includes(language)) return language
  return ''
}

const getDefaultLanguage = () => [
  'languages',
  'language',
  'browserLanguage',
  'systemLanguage',
  'userLanguage']
.reduce((p, v) => p || codeTranslate(window.navigator[v]), '')

class Root extends Component {
  static proptypes = {
    dispatch: PropTypes.func
  }
  componentWillMount () {
    this.props.dispatch(initState())
  }
  render () {
    const { selectingWorkspace } = this.props
    if (window.isSpaceKeySet) return <IDE />
    if (selectingWorkspace) return <WorkspaceList />
    return <IDE />
  }
}

Root = connect(
  state => state.WorkspaceState
)(Root)

export default () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Root id='root-container' />
      </ThemeProvider>
    </Provider>
  )
}
