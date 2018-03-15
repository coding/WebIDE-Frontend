const webpack = require('webpack')

// 调用平台版后台
const isPlatform = Boolean(process.env.RUN_MODE);

module.exports = function (options) {
  return {
    devServer: {
      hot: true,
      inline: true,
      host: options.host || '0.0.0.0',
      port: options.port || 8060,
      historyApiFallback: {
        rewrites: [
          { from: /\/ws/, to: '/workspace.html' },
          { from: /\/account/, to: '/account.html' },
          { from: /\/signin/, to: '/login.html' }
        ]
      }
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({ multiStep: false }),
      new webpack.NamedModulesPlugin(),
    ]
  }
}
