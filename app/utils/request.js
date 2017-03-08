/* @flow weak */
import { urlJoin, querystring as qs } from './url-helpers'
import config from '../config'
import axios from 'axios'


const defaultRequestOptions = {
  method: 'GET',
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...(config.isPlatform && {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/vnd.coding.v2+json'
    })
  }
}

const defaultFetchOptions = {
  method: 'GET',
  mode: 'cors',
  withCredentials: true,
  redirect: 'manual'
}

function interceptResponse (response) {
  if (config.isPlatform && response.headers['requests-auth'] === '1') {
    const authUrl = response.headers['requests-auth-url']
    return location.href = authUrl
  }
  return response.data
}


function handleErrorResponse (response) {
  return response
}

function request (_options) {
  var options = Object.assign({}, defaultRequestOptions, _options)
  var queryString, fetchOptions
  if (options.json) {
    options.headers['Content-Type'] = 'application/json'
    options.body = options.json
  }

  if (options.form) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.body = options.form
  }

  if (options.body) {
    options.body = (function () {
      switch (options.headers['Content-Type']) {
        case 'application/json':
          return JSON.stringify(options.body)
        case 'application/x-www-form-urlencoded':
          return qs.stringify(options.body)
        default:
          return options.body
      }
    })()
  }
  fetchOptions = Object.assign({}, defaultFetchOptions, {
    method: options.method,
    headers: options.headers || {},
    data: options.body
  })


  var url = options.absURL ? options.absURL : urlJoin(options.baseURL, options.url)
  url += (options.qs ? '?' : '') + qs.stringify(options.qs)
  return axios(url, fetchOptions).then(interceptResponse).catch(handleErrorResponse)
}

function parseMethodArgs (url, data, METHOD) {
  console.log('data', data)
  var options = {}
  options.method = METHOD
  if (typeof url === 'object') {
    options = url
  } else if (typeof url === 'string') {
    if (/^https?:\/\//.test(url)) options.absURL = url
    options.url = url
    switch (METHOD) {
      case 'GET':
      case 'DELETE':
        options.qs = data
        break
      case 'POST':
      case 'PUT':
      case 'PATCH':
        options.form = data
        break
      case 'POST_JSON':
        options.json = data
        options.method = 'POST'
        break
      default:
        options.data = data
    }
  }
  return options
}

request.get = function (url, data) {
  return request(parseMethodArgs(url, data, 'GET'))
}

request.diff = function (url, data) {
  let options = parseMethodArgs(url, data, 'GET')
  options.headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/vnd.coding.v2.diff+json'
  }
  return request(options)
}

request.diffFilesList = function (url, data) {
  let options = parseMethodArgs(url, data, 'GET')
  options.headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/vnd.coding.v2.diff-files-list+json'
  }
  return request(options)
}

request.post = function (url, data) {
  return request(parseMethodArgs(url, data, 'POST'))
}

request.postJSON = function (url, data) {
  return request(parseMethodArgs(url, data, 'POST_JSON'))
}

request.put = function (url, data) {
  return request(parseMethodArgs(url, data, 'PUT'))
}

request.patch = function (url, data) {
  return request(parseMethodArgs(url, data, 'PATCH'))
}

request.delete = function (url, data) {
  return request(parseMethodArgs(url, data, 'DELETE'))
}

export default request
