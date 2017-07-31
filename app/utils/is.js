import isNumber from 'lodash/isNumber'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'

function is (type) {
  if (isUndefined(type)) return isUndefined
  if (isNull(type)) return isNull
  switch (type) {
    case String:
      return isString
    case Number:
      return isNumber
    case Boolean:
      return isBoolean
    case Function:
      return isFunction
    case Array:
      return isArray
    case Object:
      return isPlainObject
    default:
      return undefined
  }
}

export default Object.assign(is, {
  null: isNull,
  undefined: isUndefined,
  string: isString,
  number: isNumber,
  boolean: isBoolean,
  function: isFunction,
  array: isArray,
  pojo: isPlainObject,
  plainObject: isPlainObject,
})

export {
  isNumber,
  isNull,
  isUndefined,
  isString,
  isBoolean,
  isFunction,
  isArray,
  isPlainObject,
}
