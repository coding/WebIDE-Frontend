

const contents = ['menuBarItems', 'settings', 'file', 'panel', 'tab', 'git', 'fileTree', 'global', 'modal', 'login', 'import']

export default contents.reduce((p, v) => {
  p[v] = require(`./${v}.json`)
  return p
}, {})
