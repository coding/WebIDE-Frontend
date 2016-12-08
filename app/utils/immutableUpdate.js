import update from 'immutability-helper'
import _ from 'lodash'

const removeValue = (valueToRemove, original) => {
  if (_.isArray(original)) {
    return _.without(original, valueToRemove)
  }
  if (_.isObject(original)) {
    return _.reduce(original, (result, value, key) => {
      if (value !== valueToRemove) result[key] = value
      return result
    }, {})
  }
  return original
}

update.extend('$removeValue', removeValue)
update.extend('$without', removeValue)

const removeKey = (keysToRemove, original) => {
  if (!_.isArray(original) && !_.isObject(original)) return original
  if (!_.isArray(keysToRemove)) keysToRemove = [keysToRemove]
  return _.reduce(original, (result, value, key) => {
    if (!keysToRemove.includes(key)) result[key] = value
    return result
  }, _.isArray(original) ? [] : {})
}

update.extend('$removeKey', removeKey)
update.extend('$delete', removeKey)

update.extend('$map', (fn, original) => {
  if (_.isArray(original)) return _.map(original, fn)
  if (_.isObject(original)) return _.mapValues(original, fn)
  return original
})

export default update
