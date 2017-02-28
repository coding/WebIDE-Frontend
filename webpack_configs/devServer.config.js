const webpack = require('webpack')

module.exports = function (options) {
  return {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      host: options.host || 'localhost',
      port: options.port || 8060
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin({ multiStep: true }),
      new webpack.DefinePlugin({
        __PACKAGE_SERVER__: JSON.stringify(process.env.PACKAGE_SERVER || ''),
        __DEV__: true,
      }),
      new webpack.NamedModulesPlugin(),
    ],
    module: {
      rules: [
        {
          test: /config\.js$/,
          loader: 'regexp-replace-loader',
          options: {
            match: {
              pattern: 'baseURL: \'\' \\|\\| window\\.location\\.origin,',
              flags: 'g'
            },
            replaceWith: 'baseURL: \'http://localhost:8080\' || window.location.origin,'
          }
        }
      ]
    }
  }
}
