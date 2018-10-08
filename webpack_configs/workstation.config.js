const path = require('path')
const webpack = require('webpack')
const str = JSON.stringify
const { optimize: { CommonsChunkPlugin }, DefinePlugin } = webpack
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const merge = require('webpack-merge')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()

const PROJECT_ROOT = path.resolve(__dirname, '..')

module.exports = function (options={}) {
  const {
    // mainEntryHtmlName = 'workspace.html',
    // workspacesEntryHtmlName = 'index.html',
    staticDir = 'rs',
  } = options

  const publicPath = process.env.QINIU_BUCKET ? // publicPath should end with '/'
    `${process.env.QINIU_SERVER}/` : path.join('/', staticDir, '/')
return {
  devtool: 'source-map',
  entry: {
    // main: [path.join(PROJECT_ROOT, 'app')],
    // workspaces: [path.join(PROJECT_ROOT, 'app/workspaces_standalone')],
    // vendor: ['babel-polyfill', 'react', 'react-dom', 'redux', 'react-redux'],
    workstation: [path.join(PROJECT_ROOT, 'app/workstation/workstationFull')],
    terminal: [path.join(PROJECT_ROOT, 'app/workstation/workstation')],
  },
  output: {
    publicPath,
    path: path.join(PROJECT_ROOT, 'dist', staticDir),
    filename: '[name].js',
    // chunkFilename: '[name].[chunkhash].chunk.js',
    library: 'coding-web-ide',
    libraryTarget: 'commonjs2'
  },
  // externals: {
  //   react: 'commonjs react', // this line is just to use the React dependency of our parent-testing-project instead of using our own React.
  //   diff_match_patch: 'diff_match_patch',
  //   lodash: {
  //     commonjs: 'lodash',
  //     commonjs2: 'lodash',
  //     amd: 'lodash',
  //     root: '_' // indicates global variable
  //   },
  //   codemirror: {
  //     commonjs: 'codemirror',
  //     commonjs2: 'codemirror',
  //     amd: 'codemirror',
  //   },
  // },
  externals: [
    /^codemirror(\/.+)?$/,
    'diff_match_patch',
    'react',
    'react-dom',
    'prop-types',
    /^lodash(\/.+)?$/,
    // 'animated-scrollto',
    // 'bootstrap-styl',
    // 'clipboard',
    // 'diff',
    // 'file-icons-js',
    'font-awesome',
    // 'filesize',
    // 'moment',
    // 'remarkable',
    // 'fixed-data-table-2',
    // 'highlight.js',
    // 'localforage',
    'marked',
    'octicons',
    // 'react-addons-css-transition-group',
    // 'react-notification',
    // 'styled-components',
    'socket.io-client-legacy',
  ],
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: ['node_modules', path.join(PROJECT_ROOT, 'app')],
    alias: {
      static: path.join(PROJECT_ROOT, 'static'),
    }
  },
  resolveLoader: {
    modules: [ path.resolve(__dirname, "./loaders/"), "node_modules" ]
  },
  plugins: [
    gitRevisionPlugin,
    new DefinePlugin({
      __VERSION__: str(gitRevisionPlugin.commithash() + '@' + gitRevisionPlugin.version()),
      __PUBLIC_PATH__: str(publicPath),
    }),
    // new CommonsChunkPlugin({
    //   name: 'chunk',
    //   filename: 'chunk.js',
    //   chunks: ['workstation'],
    //   minChunks: Infinity
    // }),
    // new CommonsChunkPlugin({
    //   name: 'vendor',
    //   filename: 'vendor.[chunkhash].js',
    //   minChunks: Infinity
    // }),
    // new CommonsChunkPlugin({
    //   name: 'webpackRuntime',
    //   chunks: ['vendor', 'workspaces'],
    //   filename: 'webpackRuntime.[hash].js'
    // }),
    // new HtmlWebpackPlugin({
    //   title: 'Coding WebIDE',
    //   excludeChunks: ['workspaces'],
    //   filename: (staticDir ? '../' : '') + mainEntryHtmlName,
    //   template: path.join(PROJECT_ROOT, 'app/index.html'),
    //   favicon: path.join(PROJECT_ROOT, 'static/favicon.ico'),
    // }),
    // new HtmlWebpackPlugin({
    //   title: 'Coding WebIDE',
    //   excludeChunks: ['main'],
    //   filename: (staticDir ? '../' : '') + workspacesEntryHtmlName,
    //   template: path.join(PROJECT_ROOT, 'app/workspaces_standalone/index.html'),
    //   favicon: path.join(PROJECT_ROOT, 'static/favicon.ico'),
    // }),
    // https://github.com/kevlened/copy-webpack-plugin
    // new CopyWebpackPlugin([{
    //   from: path.join(PROJECT_ROOT, 'static'),
    // }, {
    //   from: path.join(PROJECT_ROOT, 'node_modules/font-awesome'),
    //   to: 'font-awesome',
    // }, {
    //   from: path.join(PROJECT_ROOT, 'node_modules/octicons'),
    //   to: 'octicons',
    // }])
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}
}
