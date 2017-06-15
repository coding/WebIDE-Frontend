function loadStyle (cssUrl) {
  const styleElement = document.createElement('link')
  styleElement.rel = 'stylesheet'
  styleElement.type = 'text/css'
  styleElement.href = cssUrl

  const head = document.getElementsByTagName('head')[0]
  return {
    use () {
      head.appendChild(styleElement)
    },

    unuse () {
      head.removeChild(styleElement)
    }
  }
}

export default loadStyle
