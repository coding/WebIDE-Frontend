import getCookie from '../utils/cookie'
import notification from 'components/Notification'

const baseURL = getCookie('BACKEND_URL') || __BACKEND_URL__ || window.location.origin

const axios = {}

const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/vnd.coding.v2+json',
  'X-Requested-With': 'XMLHttpRequest'
}

function parseFormdata (formdata) {
  let str = ''
  for (const key in formdata) {
    if (formdata.hasOwnProperty(key)) {
      str += `&${key}=${formdata[key]}`
    }
  }
  str = str.slice(1)
  return str
}

axios.get = (url, overrideHeaders = {}) =>
  fetch(`${baseURL}${url}`, {
    method: 'GET',
    credentials: 'include',
    headers: { ...headers, ...overrideHeaders }
  })
    .then((res) => {
      if (res.status !== 204) {
        return res.json()
      }
    })
    .catch((err) => {
      notification.error({
        description: String(err)
      })
    })

axios.post = (url, data, overrideHeaders = {}) =>
  fetch(`${baseURL}${url}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...headers, ...overrideHeaders },
    body: parseFormdata(data)
  })
    .then((res) => {
      if (res.status !== 204) {
        return res.json()
      }
    })
    .catch((err) => {})

axios.put = (url, data, overrideHeaders = {}) =>
  fetch(`${baseURL}${url}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { ...headers, ...overrideHeaders },
    body: parseFormdata(data)
  })
    .then(res => res.json())
    .catch((err) => {
      notification.error({
        description: String(err)
      })
    })

axios.delete = (url, data, overrideHeaders = {}) =>
  fetch(`${baseURL}${url}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { ...headers, ...overrideHeaders },
    body: parseFormdata(data)
  })
    .then(res => res.json())
    .catch((err) => {
      notification.error({
        description: String(err)
      })
    })
export default axios
