const COLORS = [
  // the git tower palettes [mod]
  '#58c6f3', // blue
  '#6de6e9', // aqua
  '#ace09e', // grean
  '#59b38a', // olive
  '#f7d56b', // yellow
  '#f5a95f', // orange
  '#fe7874', // red
  '#967acc', // purple
  '#ea75f3', // violet
  '#d3d7ed', // light purplish gray
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
