/* @flow weak */
export default {
  join () {
    const path = Array.prototype.join.call(arguments, '/')
    return path.split(/\/+/).join('/')
  }
}
