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

const removeKey = (keyToRemove, original) => {
  if (!_.isArray(original) && !_.isObject(original)) return original

  return _.reduce(original, (result, value, key) => {
    if (key !== keyToRemove) result[key] = value
    return result
  }, _.isArray(original) ? [] : {})
}

update.extend('$removeKey', removeKey)
update.extend('$delete', removeKey)

export default update
