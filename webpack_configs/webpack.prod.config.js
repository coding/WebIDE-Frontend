const merge = require('webpack-merge')
const CommonConfig = require('./common.config.js')

const stylesheet = require('./stylesheet.config')
const uglify = require('./uglify.config')

module.exports = merge(
  CommonConfig,
  stylesheet(),
  uglify()
)
