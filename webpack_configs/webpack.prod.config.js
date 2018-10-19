const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const str = JSON.stringify
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commonConfig = require('./common.config.js')

const stylesheet = require('./stylesheet.config')
const uglify = require('./uglify.config')

const mainEntryHtmlName = 'workspace.html'
const accountEntryHtmlName = 'account.html'
const loginEntryHtmlName = 'login.html'
const introEntryHtmlName = 'intro.html'
const changelogEntryHtmlName = 'changelog.html'
const maintainEntryHtmlName = 'maintain.html'
const workspacesEntryHtmlName = 'index.html'
const exportEntryHtmlName = 'export.html'

const PROJECT_ROOT = path.resolve(__dirname, '..')

const staticDir = process.env.RUN_MODE ? 'rs2' : 'rs'

module.exports = merge(
  {
    entry: {
      main: ['@babel/polyfill'],
      workspaces: ['@babel/polyfill'],
      login: ['@babel/polyfill'],
    }
  },
  commonConfig({
    staticDir,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
  }),
  stylesheet(),
  uglify(),
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        multihtmlCatch: true,
        excludeChunks: ['workspaces', 'login'],
        filename: (staticDir ? '../' : '') + mainEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/index.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        multihtmlCatch: true,
        excludeChunks: ['workspaces', 'main'],
        filename: (staticDir ? '../' : '') + accountEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/account.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        multihtmlCatch: true,
        excludeChunks: ['workspaces', 'main'],
        filename: (staticDir ? '../' : '') + loginEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/login.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        excludeChunks: ['main', 'login'],
        filename: (staticDir ? '../' : '') + workspacesEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/workspaces_standalone/index.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        inject: false,
        // excludeChunks: ['workspaces', 'main', 'login', 'vendor', 'webpackRuntime'],
        filename: (staticDir ? '../' : '') + introEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/intro.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        inject: false,
        // excludeChunks: ['workspaces', 'main', 'login', 'vendor', 'webpackRuntime'],
        filename: (staticDir ? '../' : '') + changelogEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/changelog.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        inject: false,
        filename: (staticDir ? '../' : '') + exportEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/export.html'),
        // favicon: ICO_PATH,
      }),
      new HtmlWebpackPlugin({
        title: 'Cloud Studio',
        inject: false,
        // excludeChunks: ['workspaces', 'main', 'login', 'vendor', 'webpackRuntime'],
        filename: (staticDir ? '../' : '') + maintainEntryHtmlName,
        template: path.join(PROJECT_ROOT, 'app/maintain.html'),
        // favicon: ICO_PATH,
      }),
      // new webpack.HashedModuleIdsPlugin(),
      new webpack.DefinePlugin({
        __DEV__: false,
        __RUN_MODE__: str(process.env.RUN_MODE || ''),
        __BACKEND_URL__: str(process.env.BACKEND_URL || ''),
        __WS_URL__: str(process.env.WS_URL || ''),
        __STATIC_SERVING_URL__: str(process.env.STATIC_SERVING_URL || ''),
        __PACKAGE_DEV__: false,
        __PACKAGE_SERVER__: str(process.env.PACKAGE_SERVER || process.env.HTML_BASE_URL || ''),
        __NODE_ENV__: str(process.env.NODE_ENV || ''),
        __CHANGELOG_PATH__: str('/rs2/changelog/'),
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
      }),
    ]
  }
)
