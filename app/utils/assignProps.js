import is from './is'

function assignProps (target, props, opts) {
  Object.keys(opts).forEach((key) => {
    const type = opts[key]
    const isType = typeof type === 'string' ? is[type] : is(type)
    if (type === 'any' || is.function(isType) && isType(props[key])) {
      target[key] = props[key]
    }
  })
  return target
}

export default assignProps
