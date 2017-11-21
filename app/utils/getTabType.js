export default function getTabType (node) {
  if (
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
    if (node.contentType === 'image/jpeg' || node.contentType === 'image/png' || node.contentType === 'image/bmp' || node.contentType === 'image/gif') {
      return 'IMAGE'
    }
  }
  // Unknown
  return 'UNKNOWN'
}
