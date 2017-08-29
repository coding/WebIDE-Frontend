import { toJS } from 'mobx'

export const mapToJS = map => map.entries().reduce((p, v) => {
  p[v[0]] = v[1].toJS ? v[1].toJS() : toJS(v[1])
  return p
}, {})
