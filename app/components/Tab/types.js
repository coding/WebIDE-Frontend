export const getTabType = (node) => {
  if (
    /^text\/[^/]+/.test(node.contentType) || (
      node.contentType === 'application/xml'
    ) || (
      node.contentType === 'application/xhtml+xml'
    )) {
    return 'TEXT'
  } else if (/^image\/[^/]+/.test(node.contentType)) {
    return 'IMAGE'
  }
  // Unknown
  return 'UNKNOWN'
}
