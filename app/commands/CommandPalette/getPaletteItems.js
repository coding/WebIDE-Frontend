import commandPaletteItems from './items'

let queryCache = {}
const getFromCache = (query) => {
  if (Object.keys(queryCache).length > 10000) queryCache = {}
  if (queryCache.hasOwnProperty(query)) {
    return ['exact_match', queryCache[query]]
  }
  if (queryCache.hasOwnProperty(query.slice(0, -1))) {
    return ['last_match', queryCache[query.slice(0, -1)]]
  }
  return ['no_match', undefined]
}

export default function getPaletteItems (query) {
  if (!query) return commandPaletteItems
  query = query.toLowerCase().replace(/\ /g, '')

  let [cacheState, itemsToFilter] = getFromCache(query)
  switch (cacheState) {
    case 'exact_match':
      return itemsToFilter
    case 'last_match':
      break
    case 'no_match':
      itemsToFilter = commandPaletteItems
  }

  const filteredItems = itemsToFilter.reduce((filteredItems, item) => {
    const itemNameChars = item.name.toLowerCase().split('')
    const queryChars = query.split('')

    let missed = false
    const charIndexes = queryChars.reduce((charIndexes, char) => {
      let begin = (charIndexes.length)
      ? charIndexes[charIndexes.length - 1] + 1
      : begin = 0

      let indexOfChar = itemNameChars.slice(begin).indexOf(char)
      if (indexOfChar === -1) {
        missed = true
      } else {
        indexOfChar += begin  // compensate the offset
      }

      charIndexes.push(indexOfChar)
      return charIndexes
    }, [])

    if (!missed) filteredItems.push({ ...item, em: charIndexes })
    return filteredItems
  }, [])

  queryCache[query] = filteredItems
  return filteredItems
}
