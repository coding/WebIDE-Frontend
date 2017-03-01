const merge = require('webpack-merge')
const CommonConfig = require('./common.config.js')

const devServer = require('./devServer.config')
const stylesheet = require('./stylesheet.config')

const reactHotLoaderPrependEntries = [
  'react-hot-loader/patch',
  'webpack-dev-server/client?http://localhost:8060',
  'webpack/hot/only-dev-server',
]

module.exports = merge(
  {
    entry: {
      main: reactHotLoaderPrependEntries,
      workspaces: reactHotLoaderPrependEntries,
    }
  },
  CommonConfig,
  { devtool: 'inline-source-map' },
  devServer({ port: 8060 }),
  stylesheet()
)
