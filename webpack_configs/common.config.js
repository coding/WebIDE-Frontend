const path = require('path')
const webpack = require('webpack')
const str = JSON.stringify
const { DefinePlugin } = webpack
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const GitRevisionPlugin = require('git-revision-webpack-plugin')
const gitRevisionPlugin = new GitRevisionPlugin()
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const initMonacoPluginConfig = require('./monaco-plugin-config/initialOptions')
const HappyPack = require('happypack')

const os = require('os')

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const PROJECT_ROOT = path.resolve(__dirname, '..')
// const ICO_PATH = path.join(PROJECT_ROOT, 'static/favicon.ico')
// const ICO_PATH = '//studio-res.coding.net/StudioWebResource/Images/favicon.ico'

module.exports = function (options={}) {
  const {
    mainEntryHtmlName = 'workspace.html',
    accountEntryHtmlName = 'account.html',
    loginEntryHtmlName = 'login.html',
    introEntryHtmlName = 'intro.html',
    changelogEntryHtmlName = 'changelog.html',
    maintainEntryHtmlName = 'maintain.html',
    workspacesEntryHtmlName = 'index.html',
    staticDir = 'rs',
    filename = '[name].[hash].js',
    chunkFilename = '[name].[hash].chunk.js'
  } = options

  const publicPath = process.env.QINIU_BUCKET ? // publicPath should end with '/'
    `${process.env.QINIU_SERVER}/` : path.join('/', staticDir, '/')
return {
  entry: {
    main: [path.join(PROJECT_ROOT, 'app')],
    workspaces: [path.join(PROJECT_ROOT, 'app/workspaces_standalone')],
    login: [path.join(PROJECT_ROOT, 'app/login.jsx')],
    // intro: [path.join(PROJECT_ROOT, 'app/intro.jsx')],
    vendor: ['@babel/polyfill', 'react', 'react-dom', 'redux', 'react-redux'],
  },
  output: {
    publicPath,
    path: path.join(PROJECT_ROOT, 'build', staticDir),
    filename,
    chunkFilename,
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: ['node_modules', path.join(PROJECT_ROOT, 'app')],
    alias: {
      static: path.join(PROJECT_ROOT, 'static'),
    }
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, './loaders/'), 'node_modules']
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    crypto: 'empty',
  },
  plugins: [
    gitRevisionPlugin,
    // new BundleAnalyzerPlugin(),
    new DefinePlugin({
      __VERSION__: str(gitRevisionPlugin.commithash() + '@' + gitRevisionPlugin.version()),
      __PUBLIC_PATH__: str(publicPath),
    }),
    // https://github.com/kevlened/copy-webpack-plugin
    new CopyWebpackPlugin([{
      from: path.join(PROJECT_ROOT, 'static'),
    }, {
      from: path.join(PROJECT_ROOT, 'node_modules/font-awesome'),
      to: 'font-awesome',
    }, {
      from: path.join(PROJECT_ROOT, 'node_modules/octicons'),
      to: 'octicons',
    }]),
    new MonacoWebpackPlugin(initMonacoPluginConfig),
    new HappyPack({
      id: 'babel',
      loaders: ['babel-loader?cacheDirectory'],
      threadPool: happyThreadPool,
      verbose: true
    })
  ],
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'happypack/loader?id=babel' },
      { test: /\.md$/, use: ['raw-loader'] }
    ]
  }
}
}
