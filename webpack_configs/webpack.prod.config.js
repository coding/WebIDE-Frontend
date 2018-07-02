const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const str = JSON.stringify
const commonConfig = require('./common.config.js')

const stylesheet = require('./stylesheet.config')
const uglify = require('./uglify.config')

module.exports = merge(
  commonConfig({
    staticDir: process.env.RUN_MODE ? 'rs2' : 'rs',
  }),
  stylesheet(),
  uglify(),
  {
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: false,
        __RUN_MODE__: str(process.env.RUN_MODE || ''),
        __BACKEND_URL__: str(process.env.BACKEND_URL || ''),
        __WS_URL__: str(process.env.WS_URL || ''),
        __STATIC_SERVING_URL__: str(process.env.STATIC_SERVING_URL || ''),
        __PACKAGE_DEV__: false,
        __PACKAGE_SERVER__: str(process.env.PACKAGE_SERVER || process.env.HTML_BASE_URL || ''),
        __NODE_ENV__: str(process.env.NODE_ENV || ''),
        __CHANGELOG_PATH__: str(''),
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
      }),
    ]
  }
)
