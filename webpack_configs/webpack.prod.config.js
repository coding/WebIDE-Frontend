const webpack = require('webpack')
const merge = require('webpack-merge')
const str = JSON.stringify
const CommonConfig = require('./common.config.js')

const stylesheet = require('./stylesheet.config')
const uglify = require('./uglify.config')

module.exports = merge(
  CommonConfig,
  stylesheet(),
  uglify()
  {
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: false,
        __RUN_MODE__: str(process.env.RUN_MODE || 'open'),
        __BACKEND_URL__: str(process.env.BACKEND_URL || ''),
        __WS_URL__: str(process.env.WS_URL || ''),
      }),
    ]
  }
)
