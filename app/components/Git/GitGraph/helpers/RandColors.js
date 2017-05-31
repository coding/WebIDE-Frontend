const COLORS = [
  // credit: https://github.com/mrmrs/colors
  '#2E8AE6', // blue
  '#FFDC00', // yellow
  '#FF4136', // red
  '#FF851B', // orange
  '#3D9970', // olive
  '#B10DC9', // purple
  '#2ECC40', // green
  '#54e8e2', // tifany
  '#01FF70', // lime
  '#001F3F', // navy
  '#F012BE', // fuchsia
  '#7FDBFF', // aqua
  '#39CCCC', // teal
  '#85144B', // maroon
]

export default class RandColors {
  constructor () {
    this.colors = COLORS.slice()
    this._index = 0
    this._period = this.colors.length
  }

  get () {
    return this.colors[this._index++ % this._period]
  }
}
