module.exports = process.env.NODE_ENV === 'production' ?
    require('./webpack_configs/webpack.prod.config.js')
  : require('./webpack_configs/webpack.dev.config.js')
