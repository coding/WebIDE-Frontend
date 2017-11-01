/*eslint-disable*/
require('dotenv').config()
module.exports = (process.env.NODE_ENV === 'production') || (!process.env.NODE_ENV) ?
    require('./webpack_configs/webpack.prod.config.js')
  : (process.env.NODE_ENV === 'staging' ? require('./webpack_configs/webpack.staging.config.js') :
  require('./webpack_configs/webpack.dev.config.js'))
