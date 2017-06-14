const get = (obj, prop) => {
  if (typeof obj.get === 'function') return obj.get(prop)
  return obj[prop]
}

function mapEntityFactory (entities) {
  // this decorator simply allows getting entity by id
  return function mapEntity (entityNames) {
    entityNames = Array.isArray(entityNames) ? entityNames : [...arguments]
    return function decorator (target, key, descriptor) {
      const fn = descriptor.value
      return {
        ...descriptor,
        value () {
          let args = [...arguments]
          args = args.map((entityId, i) => {
            const entityName = entityNames[i]
            if (entityName && typeof entityId === 'string') {
              return get(entities[entityName], entityId)
            }
            return entityId
          })
          return fn.apply(this, args)
        }
      }
    }
  }
}

export default mapEntityFactory
