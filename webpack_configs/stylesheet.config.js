const bootstrap = require('bootstrap-styl')

module.exports = function (paths) {
  return {
    module: {
      loaders: [
        {
          test: /\.woff\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          loaders: ['file']
          // loader: "url?limit=10000&mimetype=application/font-woff"
        }, {
          test: /\.woff2\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          loaders: ['file']
          // loader: "url?limit=10000&mimetype=application/font-woff"
        }, {
          test: /\.ttf\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          loaders: ['file']
          // loader: "url?limit=10000&mimetype=application/octet-stream"
        }, {
          test: /\.eot\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          loaders: ['file']
        }, {
          test: /\.svg\??([a-f\d]+)?(v=\d+\.\d+\.\d+)?$/,
          loaders: ['file']
          // loader: "url?limit=10000&mimetype=image/svg+xml"
        }, {
          test: /\.styl$/,
          loaders: ['style', 'css', 'stylus']
        }
      ]
    },
    stylus: {
      use: [bootstrap()]
    }
  }
}
