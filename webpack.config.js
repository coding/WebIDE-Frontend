/*eslint-disable*/
require('dotenv').config()
var production = ['production', 'prod'];

// module.exports = (process.env.NODE_ENV && production.indexOf(process.env.NODE_ENV) > -1) ?
//     require('./webpack_configs/webpack.prod.config.js')
//   : (process.env.NODE_ENV === 'staging' ? require('./webpack_configs/webpack.staging.config.js') :
//   require('./webpack_configs/webpack.dev.config.js'))
if (process.env.RUN_MODE === 'lib') {
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'dev') {
    module.exports = require('./webpack_configs/webpack.lib.dev.config.js')
  } else {
    module.exports = require('./webpack_configs/webpack.lib.config.js')
  }
} else if (process.env.NODE_ENV && production.indexOf(process.env.NODE_ENV) > -1) {
  module.exports = require('./webpack_configs/webpack.prod.config.js')
} else if (process.env.NODE_ENV === 'staging') {
  module.exports = require('./webpack_configs/webpack.staging.config.js')
} else {
  module.exports = require('./webpack_configs/webpack.dev.config.js')
}

