import memoize from 'lodash/memoize'

function getCookie (name) {
  var value = "; " + document.cookie
  var parts = value.split("; " + name + "=")
  if (parts.length == 2) return parts.pop().split(";").shift()
}

export default memoize(getCookie, name => name + '@' + document.cookie)
