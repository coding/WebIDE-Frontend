const webpack = require('webpack')

// 调用平台版后台
const isPlatform = Boolean(process.env.RUN_MODE);

module.exports = function (options) {
  return {
    devServer: {
      hot: true,
      inline: true,
      disableHostCheck: true,
      host: options.host || '0.0.0.0',
      port: options.port || 8060,
      historyApiFallback: {
        rewrites: [
          { from: /\/ws/, to: '/workspace.html' },
          { from: /\/account/, to: '/account.html' },
          { from: /\/signin/, to: '/login.html' },
          { from: /\/intro/, to: '/intro.html' },
          { from: /\/changelog/, to: '/changelog.html' },
          { from: /\/maintain/, to: '/maintain.html' },
        ]
      }
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({ multiStep: false }),
      new webpack.NamedModulesPlugin(),
    ]
  }
}
