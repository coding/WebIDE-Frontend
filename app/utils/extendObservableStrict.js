import { extendObservable } from 'mobx'

// extendObservableStrict is like extendObservable,
// except it only accept extension properties that appeared in defaults
export default function extendObservableStrict (obj, defaults, extensions) {
  const acceptableKeys = Object.keys(defaults)
  const acceptables = Object.keys(extensions).reduce((acc, key) => {
    if (acceptableKeys.includes(key)) acc[key] = extensions[key]
    return acc
  }, {})
  return extendObservable(obj, defaults, acceptables)
}