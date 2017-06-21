import { extendObservable } from 'mobx'

export default function assignObservable (obj, defaults, extensions) {
  const acceptableKeys = Object.keys(defaults)
  const acceptables = Object.keys(extensions).reduce((acc, key) => {
    if (acceptableKeys.includes(key)) acc[key] = extensions[key]
    return acc
  }, {})
  return extendObservable(obj, defaults, acceptables)
}