const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const str = JSON.stringify
const HtmlWebpackPlugin = require('html-webpack-plugin')
const commonConfig = require('./common.config.js')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const devServer = require('./devServer.config')
const stylesheet = require('./stylesheet.config')

const fs = require('fs')
const YAML = require('yamljs')

let getPluginsPorts = ''
const TASK_YAML = path.resolve(__dirname, '../task.yaml')

try {
  const data = fs.readFileSync(TASK_YAML, 'utf-8')
  getPluginsPorts = YAML.parse(data).apps
  .filter(task => task.name && task.name.split('-')[0] === 'plugin')
  .map(task => task.env ? task.env.PORT || 4000 : 4000)
  console.log(`find ${getPluginsPorts.length} dev ports`, getPluginsPorts.join(','))
} catch (e) {
  console.log('find task error', e && e.message)
}

const reactHotLoaderPrependEntries = [
  'react-hot-loader/patch',
  'webpack-dev-server/client?http://ide.test:8060',
  'webpack/hot/only-dev-server',
]
const PROJECT_ROOT = path.resolve(__dirname, '..')

const mainEntryHtmlName = 'workspace.html'
const dashboardEntryHtmlName = 'dashboard.html'
const accountEntryHtmlName = 'account.html'
const loginEntryHtmlName = 'login.html'
const introEntryHtmlName = 'intro.html'
const changelogEntryHtmlName = 'changelog.html'
const exportEntryHtmlName = 'export.html'
const iframeEntryHtmlName = 'iframe-test.html'

const staticDir = ''

const config = merge(
  {
    entry: {
      main: reactHotLoaderPrependEntries,
      // intro: reactHotLoaderPrependEntries,
    }
  },
  commonConfig({
    staticDir,
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].chunk.js',
  }),
  /*
   * See: https://webpack.js.org/configuration/devtool/#devtool
   * devtool                       | build | rebuild | quality                       | production
   * --------------------------------------------------------------------------------------------
   * eval                          | +++   | +++     | generated code                | no
   * cheap-eval-source-map         | +     | ++      | transformed code (lines only) | no
   * cheap-source-map              | +     | o       | transformed code (lines only) | yes
   * cheap-module-eval-source-map  | o     | ++      | original source (lines only)  | no
   * cheap-module-source-map       | o     | -       | original source (lines only)  | yes
   * eval-source-map               | --    | +       | original source               | no
   * source-map                    | --    | --      | original source               | yes
   * inline-source-map             | --    | --      | original source               | no
   * hidden-source-map             | --    | --      | original source               | yes
   * nosource-source-map           | --    | --      | without source content        | yes
   *
   * + means faster, - slower and o about the same time
   */
  { devtool: 'cheap-module-eval-source-map' },
  { plugins: [
    new HtmlWebpackPlugin({
      title: 'Cloud Studio',
      multihtmlCatch: true,
      excludeChunks: ['workspaces', 'login','dashboard'],
      filename: (staticDir ? '../' : '') + mainEntryHtmlName,
      template: path.join(PROJECT_ROOT, 'app/index.html'),
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      multihtmlCatch: true,
      chunks: ['vendor', 'dashboard'],
      filename: (staticDir ? '../' : '') + dashboardEntryHtmlName,
      template: path.join(PROJECT_ROOT, 'app/dashboard.html'),
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      multihtmlCatch: true,
      excludeChunks: ['workspaces', 'main','dashboard'],
      filename: (staticDir ? '../' : '') + accountEntryHtmlName,
      template: path.join(PROJECT_ROOT, 'app/account.html'),
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      multihtmlCatch: true,
      excludeChunks: ['workspaces', 'main','dashboard'],
      filename: (staticDir ? '../' : '') + loginEntryHtmlName,
      template: path.join(PROJECT_ROOT, 'app/login.html'),
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      inject: false,
      filename: (staticDir ? '../' : '') + introEntryHtmlName,
      template: path.join(PROJECT_ROOT, 'app/intro.html'),
      backendUrl: str(process.env.BACKEND_URL || ''),
      staticUrl: path.join('/static/'),
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      inject: false,
      filename: (staticDir ? '../' : '') + changelogEntryHtmlName,
      template: path.join(PROJECT_ROOT, 'app/changelog.html'),
      backendUrl: str(process.env.BACKEND_URL || ''),
    }),
    new HtmlWebpackPlugin({
      title: 'Coding WebIDE',
      inject: false,
      filename: (staticDir ? '../' : '') + iframeEntryHtmlName,
      iframeUrl: str('ide.test:8060/intro'),
      template: path.join(PROJECT_ROOT, 'app/iframe-test.html'),

    }),

    // new HtmlWebpackPlugin({
    //   title: 'Cloud Studio',
    //   inject: false,
    //   filename: (staticDir ? '../' : '') + changelogEntryHtmlName,
    //   template: path.join(PROJECT_ROOT, 'app/changelog.html'),
    //   backendUrl: str(process.env.BACKEND_URL || '')
    //   // favicon: ICO_PATH,
    // }),
    new webpack.DefinePlugin({
      __DEV__: true,
      __RUN_MODE__: str(process.env.RUN_MODE || ''),
      __BACKEND_URL__: str(process.env.BACKEND_URL || ''),
      __WS_URL__: str(process.env.WS_URL || ''),
      __STATIC_SERVING_URL__: str(process.env.STATIC_SERVING_URL || ''),
      __PACKAGE_DEV__: process.env.PACKAGE_DEV,
      __PACKAGE_SERVER__: str(process.env.PACKAGE_SERVER || process.env.HTML_BASE_URL || ''),
      __PACKAGE_PORTS__: str(getPluginsPorts),
      __NODE_ENV__: str(process.env.NODE_ENV || ''),
      __CHANGELOG_PATH__: str('/changelog/')
    }),
    new HardSourceWebpackPlugin()
  ]
  },
  devServer({ port: 8060 }),
  stylesheet()
)

module.exports = config
