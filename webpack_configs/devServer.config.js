const webpack = require('webpack')

// 调用平台版后台
const isPlatform = (process.env.RUN_MODE == 'platform');

module.exports = function (options) {
  return {
    devServer: {
      hot: true,
      inline: true,
      host: options.host || '0.0.0.0',
      port: options.port || 8060,
      historyApiFallback: {
        rewrites: [
          { from: /\/ws/, to: '/workspace.html'}
        ]
      }
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({ multiStep: false }),
      new webpack.NamedModulesPlugin(),
    ]
  }
}
