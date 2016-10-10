/* @flow weak */
export default {
  join: function () {
    var path = Array.prototype.join.call(arguments, '/')
    return path.split(/\/+/).join('/')
  }
}
