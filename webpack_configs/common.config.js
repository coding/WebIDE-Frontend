const path = require('path')
const webpack = require('webpack')
const { optimize: { CommonsChunkPlugin } } = webpack
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const merge = require('webpack-merge')

const rootDir = path.resolve(__dirname, '..')

const CommonConfig = {
  entry: {
    main: path.join(rootDir, 'app'),
    vendor: ['babel-polyfill']
  },
  output: {
    path: path.join(rootDir, 'build'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  resolveLoader: {
    modules: [ path.resolve(__dirname, "./loaders/"), "node_modules" ]
  },
  plugins: [
    new CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[chunkhash].js',
      minChunks: Infinity
    }),
    new CommonsChunkPlugin({
      name: 'meta',
      chunks: ['vendor'],
      filename: 'webpackRuntime.js'
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      template: path.join(rootDir, 'app/index.html')
    }),
    new CopyWebpackPlugin([{
      from: path.join(rootDir, 'static/favicon.ico')
    }])
  ],
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}

module.exports = CommonConfig
