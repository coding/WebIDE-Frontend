import isNumber from 'lodash/isNumber'
import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'

export default {
  number: isNumber,
  null: isNull,
  undefined: isUndefined,
  string: isString,
  boolean: isBoolean,
  function: isFunction,
  array: isArray,
  pojo: isPlainObject,
  plainObject: isPlainObject,
}

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
