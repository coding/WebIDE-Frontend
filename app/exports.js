import cloudstudio from './extensions'

const app = {
  backendAPI: require('backendAPI'),
  commands: require('commands'),
  commons: require('commons/exports'),
  components: require('components/exports'),
  utils: require('utils/exports'),
  config: require('./config'),
  settings: require('./settings'),
  settingFormState: require('components/Setting/state'),
  settingActions: require('components/Setting/actions'),
  initializeActions: require('containers/Initialize/actions')
}

const lib = {
  react: require('react'),
  mobx: require('mobx'),
  mobxReact: require('mobx-react'),
  classnames: require('classnames'),
  lodash: require('lodash'),
  eventemitter: require('eventemitter3'),
  sockjsClient: require('sockjs-client'),
  moment: require('moment'),
  codemirror: require('codemirror'),
  reactDom: require('react-dom'),
  axios: require('axios'),
  localforage: require('localforage'),
  styled: require('styled-components'),
  clipboard: require('clipboard'),
  reactRedux: require('react-redux'),
  redux: require('redux'),
  reduxThunk: require('redux-thunk'),
  propTypes: require('prop-types'),
  socketIOClient: require('socket.io-client')
}

export { app, lib, cloudstudio }
