const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const merge = require('webpack-merge')

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
}

const CommonConfig = {
  entry: ['babel-polyfill', PATHS.app],
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo',
      template: 'app/index.html'
    }),
    new CopyWebpackPlugin([{
      from: 'static/favicon.ico'
    }])
  ],
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}

const devServer = require('./webpack_configs/devServer.config')
const uglify = require('./webpack_configs/uglify.config')
const stylesheet = require('./webpack_configs/stylesheet.config')
var config

switch (process.env.NODE_ENV) {
  case 'production':
    config = merge(
      CommonConfig,
      stylesheet()
    )
    break

  default:
    config = merge(
      CommonConfig,
      {devtool: 'eval-source-map'},
      devServer({port: 8080}),
      stylesheet()
    )
}

module.exports = config
