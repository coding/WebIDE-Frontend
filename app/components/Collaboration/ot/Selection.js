import { isRetain, isInsert } from './TextOperation'

class Range {
  // Range has `anchor` and `head` properties, which are zero-based indices into
  // the document. The `anchor` is the side of the selection that stays fixed,
  // `head` is the side of the selection where the cursor is. When both are
  // equal, the range represents a cursor.
  constructor (anchor, head) {
    this.anchor = anchor
    this.head = head
  }

  static fromJSON (obj) {
    return new Range(obj.anchor, obj.head)
  }

  equals (other) {
    return this.anchor === other.anchor && this.head === other.head
  }

  isEmpty () {
    return this.anchor === this.head
  }

  transform (other) {
    function transformIndex (index) {
      let newIndex = index
      const ops = other.ops
      for (let i = 0, l = other.ops.length; i < l; i++) {
        const op = ops[i]
        if (isRetain(op)) {
          index -= op
        } else if (isInsert(op)) {
          newIndex += op.length
        } else {
          newIndex -= Math.min(index, -op)
          index += op
        }
        if (index < 0) { break }
      }
      return newIndex
    }

    const newAnchor = transformIndex(this.anchor)
    if (this.anchor === this.head) {
      return new Range(newAnchor, newAnchor)
    }
    return new Range(newAnchor, transformIndex(this.head))
  }
}

// A selection is basically an array of ranges. Every range represents a real
// selection or a cursor in the document (when the start position equals the
// end position of the range). The array must not be empty.
class Selection {
  static Range = Range
  constructor (ranges) {
    this.ranges = ranges || []
  }

  static createCursor (position) {
    return new Selection([new Range(position, position)])
  }

  static fromJSON (obj) {
    const objRanges = obj.ranges || obj;
    const ranges = objRanges.map(Range.fromJSON)
    return new Selection(ranges)
  }

  equals (other) {
    if (this.position !== other.position) return false
    if (this.ranges.length !== other.ranges.length) return false
    const sorter = (r1, r2) => (r1.anchor + r1.head) - (r2.anchor + r2.head)
    const thisRanges = this.ranges.slice().sort(sorter)
    const otherRanges = other.ranges.slice().sort(sorter)

    for (let i = 0; i < thisRanges.length; i++) {
      if (!thisRanges[i].equals(otherRanges[i])) return false
    }
    return true
  }

  somethingSelected () {
    for (let i = 0; i < this.ranges.length; i++) {
      if (!this.ranges[i].isEmpty()) return true
    }
    return false
  }

  // Return the more current selection information.
  compose (other) {
    return other
  }

  // @note: I don't really understand the logic below...
  // Update the selection with respect to an operation.
  transform (other) {
    const newRanges = []
    for (let i = 0; i < this.ranges.length; i++) {
      newRanges[i] = this.ranges[i].transform(other)
    }
    return new Selection(newRanges)
  }
}

export default Selection
