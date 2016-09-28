/* @flow weak */
import qs from 'querystring'
import _ from 'lodash'

// source: https://github.com/jfromaniello/url-join
export function urlJoin () {
  var str = [].slice.call(arguments, 0).join('/')

  // make sure protocol is followed by two slashes
  str = str.replace(/:\//g, '://')

  // remove consecutive slashes
  str = str.replace(/([^:\s])\/+/g, '$1/')

  // remove trailing slash before parameters or hash
  str = str.replace(/\/(\?|&|#[^!])/g, '$1')

  // replace ? in parameters with &
  str = str.replace(/(\?.+)\?/g, '$1&')

  return str
}

const _stringify = qs.stringify.bind(qs)
qs.stringify = function (queryObject) {
  if (!queryObject) return ''
  _.forEach(queryObject, (value, key) => {
    if (_.isArray(queryObject[key])) {
      let _key = key + '[]'
      queryObject[_key] = queryObject[key]
      delete queryObject[key]
    }
  })
  return _stringify(queryObject)
}

export const querystring = qs
