const axios = require('axios')
const fs = require('fs')
const YAML = require('yamljs')

const lists = require('./.plugins.json')

const http = require('http')

const PORT = process.env.PORT || 4000
const localhost = 'http://ide.test'


console.log(`lisitening on PORT ${PORT}`)

const commonHeader = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'http://ide.test:8060',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Space-Key'
}
let getPluginsPorts = lists

try {
  const taskConfig = fs.readFileSync('./task.yaml', 'utf-8')
  const taskConfigJson = YAML.parse(taskConfig)
  getPluginsPorts = getPluginsPorts.concat(taskConfigJson.apps
  .filter(task => task.name && task.name.split('-')[0] === 'plugin')
  .map(task => task.env ? task.env.PORT || 4000 : 4000))
  console.log(`find ${getPluginsPorts.length} ports`, getPluginsPorts.join())
} catch (e) {
  console.log('e')
}

http.createServer((req, res) => {
  if (req.url === '/packages/' && getPluginsPorts) {
    const listsPromises = getPluginsPorts
    .map(port => axios.get(String(port).includes('http') ? port : `${localhost}:${port}/packages`)
      .then(res => Object.assign(res.data[0], { TARGET: String(port).includes('http') ? port : `${localhost}:${port}` }))
      .catch(e => console.log(e))
    )

    Promise.all(listsPromises)
    .then((values) => {
      const result = values.filter(v => v)
      res.writeHead(200, commonHeader)
      res.write(JSON.stringify(result))
      res.end()
    })
    .catch((e) => {
      res.writeHead(500, commonHeader)
      res.write(JSON.stringify({ error: e }))
      res.end()
    })
  } else if (req.url.startsWith('/packages/??')) {
    const pluginsString = req.url.substring(12)
    const pluginScripts = pluginsString.split(',')
    const listsPromises = getPluginsPorts
    .map((port, idx) => axios.get(String(port).includes('http') ? port : `${localhost}:${port}/packages/${pluginScripts[idx]}`)
      .then((res) => res.data)
      .catch(e => console.log(e))
    )
    Promise.all(listsPromises)
    .then((values) => {
      const result = values.join('')
      res.writeHead(200, commonHeader)
      res.write(result)
      res.end()
    })
    .catch((e) => {
      res.writeHead(500, commonHeader)
      res.write(JSON.stringify({ error: e }))
      res.end()
    })
  } else {
    res.write('it works')
    res.end()
  }
}).listen(PORT)
