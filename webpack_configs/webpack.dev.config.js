const merge = require('webpack-merge')
const CommonConfig = require('./common.config.js')

const devServer = require('./devServer.config')
const stylesheet = require('./stylesheet.config')

module.exports = merge(
  CommonConfig,
  { devtool: 'cheap-eval-source-map' },
  devServer({ port: 8080 }),
  stylesheet()
)
