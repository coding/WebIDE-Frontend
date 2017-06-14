/* @flow weak */
import { AppContainer } from 'react-hot-loader'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import WorkspaceList from './WorkspaceList'
import bootstrapping from './bootstrapping'
import '../styles/main.styl'
import '../styles/base-theme/index.styl'
import store from './store'

// first bootstrap the state, load the store
bootstrapping()

// finally render the component
const rootElement = document.getElementById('root')

if (__DEV__) {
  const hotLoaderRender = () =>
    render(
      <AppContainer>
        <Provider store={store}><WorkspaceList /></Provider>
      </AppContainer>
    , rootElement)

  hotLoaderRender()
  if (module.hot) module.hot.accept('./WorkspaceList', hotLoaderRender)
} else {
  render(<Provider store={store}><WorkspaceList /></Provider>, rootElement)
}
