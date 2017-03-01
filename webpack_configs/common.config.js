const path = require('path')
const webpack = require('webpack')
const { optimize: { CommonsChunkPlugin } } = webpack
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const merge = require('webpack-merge')

const rootDir = path.resolve(__dirname, '..')

const CommonConfig = {
  entry: {
    main: [path.join(rootDir, 'app')],
    workspaces: [path.join(rootDir, 'app/workspaces_standalone')],
    vendor: ['babel-polyfill', 'react', 'react-dom', 'redux', 'react-redux'],
  },
  output: {
    path: path.join(rootDir, 'build'),
    filename: '[name].[hash].js'
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
      name: 'webpackRuntime',
      chunks: ['vendor', 'workspaces'],
      filename: 'webpackRuntime.[hash].js'
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      excludeChunks: ['workspaces'],
      template: path.join(rootDir, 'app/index.html')
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      excludeChunks: ['main'],
      filename: 'workspaces_list.html',
      template: path.join(rootDir, 'app/workspaces_standalone/index.html')
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
