const bootstrap = require('bootstrap-styl')
const stylusLoader = require('stylus-loader')

module.exports = function (paths) {
  return {
    module: {
      rules: [
        {
          test: /\.woff\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          use: ['file-loader']
          // loader: "url?limit=10000&mimetype=application/font-woff"
        }, {
          test: /\.woff2\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          use: ['file-loader']
          // loader: "url?limit=10000&mimetype=application/font-woff"
        }, {
          test: /\.ttf\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          use: ['file-loader']
          // loader: "url?limit=10000&mimetype=application/octet-stream"
        }, {
          test: /\.eot\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          use: ['file-loader']
        }, {
          test: /\.svg\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          use: ['file-loader']
          // loader: "url?limit=10000&mimetype=image/svg+xml"
        }, {
          test: /\.styl$/,
          use: [
            'style-loader',
            'css-loader',
            'stylus-loader'
          ]
        }, {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    // https://github.com/shama/stylus-loader/issues/149
    // https://github.com/shama/stylus-loader/pull/154/files#diff-0444c5b7c3bc2c340b3654c507443b06R35
    plugins: [
      new (stylusLoader.OptionsPlugin)({
        default: { use: [bootstrap()] }
      })
    ]
  }
}
