const lists = require('./.plugins.json')
const axios = require('axios')

const http = require('http')
const PORT = process.env.PORT || 4000

console.log(`lisitening on PORT ${PORT}`)

const commonHeader = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'http://localhost:8060',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-Space-Key'
}

http.createServer((req, res) => {
  if (req.url.startsWith('/packages')) {
    const listsPromises = lists
    .map(list => axios.get(`${list}/packages`).then(res => Object.assign(res.data[0], { TARGET: list })))
    Promise.all(listsPromises)
    .then((values) => {
      const result = values
      res.writeHead(200, commonHeader)
      res.write(JSON.stringify(result))
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
