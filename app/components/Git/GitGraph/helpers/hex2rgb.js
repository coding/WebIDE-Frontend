const hex2rgb = (hex) => {
  if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
    // startsWith '#'
    if (hex.startsWith('#')) hex = hex.substr(1)
    if (hex.length == 3) {
      hex = hex.split('')
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }
    const u = parseInt(hex, 16)
    const r = u >> 16
    const g = u >> 8 & 0xFF
    const b = u & 0xFF
    return [r, g, b]
  }
}

export default hex2rgb
