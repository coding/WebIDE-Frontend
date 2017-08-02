export default function hueFromString (name) {
  let a = 1
  for (let i = 0; i < name.length; i++) {
    a = 17 * (a + name.charCodeAt(i)) % 360
  }
  return Math.round(a)
}
