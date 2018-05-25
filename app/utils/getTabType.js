const applicationTypes = ['application/xml', 'application/x-sh', 'application/xhtml+xml'];
const imageTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif', 'image/webp', 'image/x-icon', 'image/tiff', 'image/x-tga', 'image/vnd.fpx', 'image/vnd.dxf'];

export default function getTabType (type = '') {
  if (type === 'text/x-web-markdown') {
    return 'MARKDOWN';
  } else if (type === 'text/html') {
    return 'HTML';
  } else if (type.indexOf('text') !== -1 || applicationTypes.includes(type)) {
    return 'TEXT';
  } else if (imageTypes.includes(type)) {
    return 'IMAGE';
  } else {
    return 'UNKNOWN';
  }
}
