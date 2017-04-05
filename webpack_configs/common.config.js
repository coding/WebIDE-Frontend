const path = require('path')
const webpack = require('webpack')
const { optimize: { CommonsChunkPlugin } } = webpack
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const merge = require('webpack-merge')

const rootDir = path.resolve(__dirname, '..')

module.exports = function (options={}) {
  const {
    mainEntryHtmlName = 'workspace.html',
    workspacesEntryHtmlName = 'index.html',
    staticDir = 'rs',
  } = options

return {
  entry: {
    main: [path.join(rootDir, 'app')],
    workspaces: [path.join(rootDir, 'app/workspaces_standalone')],
    vendor: ['babel-polyfill', 'react', 'react-dom', 'redux', 'react-redux'],
  },
  output: {
    publicPath: path.join('/', staticDir, '/'), // publicPath should end with '/'
    path: path.join(rootDir, 'build', staticDir),
    filename: '[name].[hash].js'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      'utils': path.join(rootDir, 'app/utils/index.js')
    }
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
      filename: (staticDir ? '../' : '') + mainEntryHtmlName,
      template: path.join(rootDir, 'app/index.html')
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      excludeChunks: ['main'],
      filename: (staticDir ? '../' : '') + workspacesEntryHtmlName,
      template: path.join(rootDir, 'app/workspaces_standalone/index.html')
    }),
    new CopyWebpackPlugin([{
      from: path.join(rootDir, 'static/favicon.ico'),
      to: (staticDir ? '../' : './'),
    }])
  ],
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}
}
