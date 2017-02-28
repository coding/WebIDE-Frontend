const merge = require('webpack-merge')
const CommonConfig = require('./common.config.js')

const devServer = require('./devServer.config')
const stylesheet = require('./stylesheet.config')

module.exports = merge(
  {
    entry: {
      main: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:8060',
        'webpack/hot/only-dev-server',
      ]
    }
  },
  CommonConfig,
  { devtool: 'inline-source-map' },
  devServer({ port: 8060 }),
  stylesheet()
)
