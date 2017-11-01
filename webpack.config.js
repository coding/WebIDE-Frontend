/*eslint-disable*/
require('dotenv').config()
var production = ['production', 'prod'];

module.exports = (production.indexOf(process.env.NODE_ENV) > -1) || (!process.env.NODE_ENV) ?
    require('./webpack_configs/webpack.prod.config.js')
  : (process.env.NODE_ENV === 'staging' ? require('./webpack_configs/webpack.staging.config.js') :
  require('./webpack_configs/webpack.dev.config.js'))
