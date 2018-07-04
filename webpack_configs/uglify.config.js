const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
module.exports = function (options) {
  return {
    plugins: [
      new UglifyJSPlugin({
        parallel: true
      })
    ]
  }
}
