function browserDetect () {
  const sys = {}
  const ua = navigator.userAgent.toLowerCase()
  let s
  ;(s = ua.match(/edge\/([\d.]+)/))
    ? (sys.edge = s[1])
    : (s = ua.match(/rv:([\d.]+)\) like gecko/))
      ? (sys.ie = s[1])
      : (s = ua.match(/msie ([\d.]+)/))
        ? (sys.ie = s[1])
        : (s = ua.match(/firefox\/([\d.]+)/))
          ? (sys.firefox = s[1])
          : (s = ua.match(/chrome\/([\d.]+)/))
            ? (sys.chrome = s[1])
            : (s = ua.match(/opera.([\d.]+)/))
              ? (sys.opera = s[1])
              : (s = ua.match(/version\/([\d.]+).*safari/)) ? (sys.safari = s[1]) : 0

  if (sys.edge) return 'Edge'
  if (sys.ie) return 'IE'
  if (sys.firefox) return 'Firefox'
  if (sys.chrome) return 'Chrome'
  if (sys.opera) return 'Opera'
  if (sys.safari) return 'Safari'

  return 'Unknown'
}

export default browserDetect
