import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'

export default {
  null: isNull,
  undefined: isUndefined,
  string: isString,
  boolean: isBoolean,
  function: isFunction,
  array: isArray,
}

export {
  isNull,
  isUndefined,
  isString,
  isBoolean,
  isFunction,
  isArray,
}
