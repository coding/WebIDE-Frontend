
export default (configMap) => (title = '', key) => {
  const suffix = title.split('.').pop()
  if (!configMap[suffix]) {
    if (!configMap.default) return ''
    return configMap.default[key] ? configMap.default[key] : configMap.default
  }
  return configMap[suffix][key] ? configMap[suffix][key] : configMap[suffix]
}
