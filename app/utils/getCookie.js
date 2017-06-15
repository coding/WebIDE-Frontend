import memoize from 'lodash/memoize'

function getCookie (name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length == 2) return parts.pop().split(';').shift()
}

export default memoize(getCookie, name => `${name}@${document.cookie}`)
