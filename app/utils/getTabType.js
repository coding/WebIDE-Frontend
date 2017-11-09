export default function getTabType (node) {
  if (node.contentType === 'text/html') {
    return 'HTML'
  } else if (
    /^text\/[^/]+/.test(node.contentType) || (
      node.contentType === 'application/xml'
    ) || (
      node.contentType === 'application/xhtml+xml'
    )) {
    return 'TEXT'
  } else if (/^image\/[^/]+/.test(node.contentType)) {
    if (node.contentType === 'image/vnd.adobe.photoshop') {
      return 'UNKNOWN'
    }
    return 'IMAGE'
  }
  // Unknown
  return 'UNKNOWN'
}
