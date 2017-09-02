import { toJS } from 'mobx'

export const mapToJS = map => map.entries()
.reduce((p, v) => {
  const newValue = v[1].toJS ? v[1].toJS() : toJS(v[1])
  if (newValue) {
    p[v[0]] = newValue
  }
  return p
}, {})
