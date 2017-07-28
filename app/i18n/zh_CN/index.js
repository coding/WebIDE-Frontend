const contents = ['menuBarItems', 'settings', 'file', 'panel', 'tab', 'git', 'fileTree', 'global', 'ot']

export default contents.reduce((p, v) => {
  p[v] = require(`./${v}.json`)
  return p
}, {})
