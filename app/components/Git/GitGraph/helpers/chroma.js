// credit to: https://github.com/gka/chroma.js
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI
const LAB_CONSTANTS = {
  // Corresponds roughly to RGB brighter/darker
  Kn: 18,

  // D65 standard referent
  Xn: 0.950470,
  Yn: 1,
  Zn: 1.088830,

  t0: 0.137931034,  // 4 / 29
  t1: 0.206896552,  // 6 / 29
  t2: 0.12841855,   // 3 * t1 * t1
  t3: 0.008856452,  // t1 * t1 * t1
}

const limit = (x, min=0, max=1) => {
  if (x < min) x = min
  if (x > max) x = max
  return x
}

const hex2rgb = (hex) => {
  if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
    // startsWith '#'
    if (hex.startsWith('#')) hex = hex.substr(1)
    if (hex.length == 3) {
      hex = hex.split('')
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
    }
    const u = parseInt(hex, 16)
    const r = u >> 16
    const g = u >> 8 & 0xFF
    const b = u & 0xFF
    return [r, g, b]
  }
}

const rgb2hex = function(r, g, b) {
  const u = r << 16 | g << 8 | b
  let str = "000000" + u.toString(16)
  str = str.substr(str.length - 6)
  return "#" + str
}


const rgb_xyz = r => ((r /= 255) <= 0.04045) ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)

const xyz_rgb = r => Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055))

const xyz_lab = t => t > LAB_CONSTANTS.t3 ? Math.pow(t, 1 / 3) : (t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0)

const lab_xyz = t => t > LAB_CONSTANTS.t1 ? (t * t * t) : (LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0))

const rgb2xyz = (r, g, b) => {
  r = rgb_xyz(r)
  g = rgb_xyz(g)
  b = rgb_xyz(b)
  const x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn)
  const y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn)
  const z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn)
  return [x, y, z]
}

const rgb2lab = (r, g, b) => {
  const [x, y, z] = rgb2xyz(r, g, b)
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)]
}

const lab2rgb = (l, a0, b0) => {
  let y = (l + 16) / 116
  let x = y + a0 / 500
  let z = y - b0 / 200

  y = LAB_CONSTANTS.Yn * lab_xyz(y)
  x = LAB_CONSTANTS.Xn * lab_xyz(x)
  z = LAB_CONSTANTS.Zn * lab_xyz(z)

  let r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z)
  let g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z)
  let b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z)

  r = limit(r, 0, 255)
  g = limit(g, 0, 255)
  b = limit(b, 0, 255)

  return [r, g, b]
}

const lab2lch = (l, a, b) => {
  const c = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * RAD2DEG + 360) % 360
  if (Math.round(c * 10000) === 0) {
    h = Number.NaN
  }
  return [l, c, h]
}

const lch2lab = (l, c, h) => {
  h *= DEG2RAD
  return [l, Math.cos(h) * c, Math.sin(h) * c]
}

const darken = (hex, amount=1) => {
  let rgb = hex2rgb(hex)
  const lab = rgb2lab(...rgb)

  lab[0] -= LAB_CONSTANTS.Kn * amount

  rgb = lab2rgb(...lab)
  return rgb2hex(...rgb)
}

const brighten = (hex, amount=1) => darken(hex, -1 * amount)
const lighten = brighten

const saturate = (hex, amount=1) => {
  let rgb = hex2rgb(hex)
  let lab = rgb2lab(...rgb)
  const lch = lab2lch(...lab)
  lch[1] += amount * LAB_CONSTANTS.Kn
  if (lch[1] < 0) lch[1] = 0

  lab = lch2lab(...lch)
  rgb = lab2rgb(...lab)
  return rgb2hex(...rgb)
}

const desaturate = (hex, amount=1) => saturate(hex, -1 * amount)

const rgb2lch = (r, g, b) => lab2lch(...rgb2lab(r, g, b))
const lch2rgb = (l, c, h) => lab2rgb(...lch2lab(l, c, h))

const chroma = {
  hex2rgb,
  rgb2hex,
  rgb2lch,
  lch2rgb,
  darken,
  brighten,
  saturate,
  desaturate,
}

export default chroma
