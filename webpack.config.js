/*eslint-disable*/
require('dotenv').config()
var production = ['production', 'prod'];

// module.exports = (process.env.NODE_ENV && production.indexOf(process.env.NODE_ENV) > -1) ?
//     require('./webpack_configs/webpack.prod.config.js')
//   : (process.env.NODE_ENV === 'staging' ? require('./webpack_configs/webpack.staging.config.js') :
//   require('./webpack_configs/webpack.dev.config.js'))

console.log('process.env.NODE_ENV', process.env.NODE_ENV)

if (process.env.NODE_ENV && production.indexOf(process.env.NODE_ENV) > -1) {
  module.exports = require('./webpack_configs/webpack.prod.config.js')
} else if (process.env.NODE_ENV === 'staging') {
  module.exports = require('./webpack_configs/webpack.staging.config.js')
} else if (process.env.NODE_ENV === 'lib') {
  module.exports = require('./webpack_configs/webpack.lib.config.js')
} else {
  module.exports = require('./webpack_configs/webpack.dev.config.js')
}

