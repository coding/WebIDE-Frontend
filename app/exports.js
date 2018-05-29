const app = {
  backendAPI: require('backendAPI'),
  commands: require('commands'),
  commons: require('commons/exports'),
  components: require('components/exports'),
  utils: require('utils/exports'),
  config: require('./config'),
  settings: require('./settings'),
  settingFormState: require('components/Setting/state')
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
}

export { app, lib }
