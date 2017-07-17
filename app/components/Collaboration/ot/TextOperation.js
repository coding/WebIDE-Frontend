export function isRetain (op) {
  return typeof op === 'number' && op > 0
}

export function isInsert (op) {
  return typeof op === 'string'
}

export function isDelete (op) {
  return typeof op === 'number' && op < 0
}

function getSimpleOp (operation, fn) {
  var ops = operation.ops;
  var isRetain = TextOperation.isRetain;
  switch (ops.length) {
  case 1:
    return ops[0];
  case 2:
    return isRetain(ops[0]) ? ops[1] : (isRetain(ops[1]) ? ops[0] : null);
  case 3:
    if (isRetain(ops[0]) && isRetain(ops[2])) { return ops[1]; }
  }
  return null;
}

function getStartIndex (operation) {
  if (isRetain(operation.ops[0])) { return operation.ops[0]; }
  return 0;
}

// Transform takes two operations A and B that happened concurrently and
// produces two operations A' and B' (in an array) such that
// `apply(apply(S, A), B') = apply(apply(S, B), A')`. This function is the
// heart of OT.
export function xform (operation1, operation2) {
  if (operation1.baseLength !== operation2.baseLength) {
    throw new Error("Both operations have to have the same base length");
  }

  var operation1prime = new TextOperation();
  var operation2prime = new TextOperation();
  var ops1 = operation1.ops, ops2 = operation2.ops;
  var i1 = 0, i2 = 0;
  var op1 = ops1[i1++], op2 = ops2[i2++];
  while (true) {
    // At every iteration of the loop, the imaginary cursor that both
    // operation1 and operation2 have that operates on the input string must
    // have the same position in the input string.

    if (typeof op1 === 'undefined' && typeof op2 === 'undefined') {
      // end condition: both ops1 and ops2 have been processed
      break;
    }

    // next two cases: one or both ops are insert ops
    // => insert the string in the corresponding prime operation, skip it in
    // the other one. If both op1 and op2 are insert ops, prefer op1.
    if (isInsert(op1)) {
      operation1prime.insert(op1);
      operation2prime.retain(op1.length);
      op1 = ops1[i1++];
      continue;
    }
    if (isInsert(op2)) {
      operation1prime.retain(op2.length);
      operation2prime.insert(op2);
      op2 = ops2[i2++];
      continue;
    }

    if (typeof op1 === 'undefined') {
      throw new Error("Cannot compose operations: first operation is too short.");
    }
    if (typeof op2 === 'undefined') {
      throw new Error("Cannot compose operations: first operation is too long.");
    }

    var minl;
    if (isRetain(op1) && isRetain(op2)) {
      // Simple case: retain/retain
      if (op1 > op2) {
        minl = op2;
        op1 = op1 - op2;
        op2 = ops2[i2++];
      } else if (op1 === op2) {
        minl = op2;
        op1 = ops1[i1++];
        op2 = ops2[i2++];
      } else {
        minl = op1;
        op2 = op2 - op1;
        op1 = ops1[i1++];
      }
      operation1prime.retain(minl);
      operation2prime.retain(minl);
    } else if (isDelete(op1) && isDelete(op2)) {
      // Both operations delete the same string at the same position. We don't
      // need to produce any operations, we just skip over the delete ops and
      // handle the case that one operation deletes more than the other.
      if (-op1 > -op2) {
        op1 = op1 - op2;
        op2 = ops2[i2++];
      } else if (op1 === op2) {
        op1 = ops1[i1++];
        op2 = ops2[i2++];
      } else {
        op2 = op2 - op1;
        op1 = ops1[i1++];
      }
    // next two cases: delete/retain and retain/delete
    } else if (isDelete(op1) && isRetain(op2)) {
      if (-op1 > op2) {
        minl = op2;
        op1 = op1 + op2;
        op2 = ops2[i2++];
      } else if (-op1 === op2) {
        minl = op2;
        op1 = ops1[i1++];
        op2 = ops2[i2++];
      } else {
        minl = -op1;
        op2 = op2 + op1;
        op1 = ops1[i1++];
      }
      operation1prime['delete'](minl);
    } else if (isRetain(op1) && isDelete(op2)) {
      if (op1 > -op2) {
        minl = -op2;
        op1 = op1 + op2;
        op2 = ops2[i2++];
      } else if (op1 === -op2) {
        minl = op1;
        op1 = ops1[i1++];
        op2 = ops2[i2++];
      } else {
        minl = op1;
        op2 = op2 + op1;
        op1 = ops1[i1++];
      }
      operation2prime['delete'](minl);
    } else {
      throw new Error("The two operations aren't compatible");
    }
  }

  return [operation1prime, operation2prime];
}

export const transform = xform


class TextOperation {
  static isRetain = isRetain
  static isInsert = isInsert
  static isDelete = isDelete
  static transform = xform

  static fromJSON = function (ops) {
    const o = new TextOperation()
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i]
      if (isRetain(op)) {
        o.retain(op)
      } else if (isInsert(op)) {
        o.insert(op)
      } else if (isDelete(op)) {
        o.delete(op)
      } else {
        throw new Error("unknown operation: " + JSON.stringify(op))
      }
    }
    return o
  }

  constructor () {
    // When an operation is applied to an input string, you can think of this as
    // if an imaginary cursor runs over the entire string and skips over some
    // parts, deletes some parts and inserts characters at some positions. These
    // actions (skip/delete/insert) are stored as an array in the "ops" property.
    this.ops = []

    // An operation's baseLength is the length of every string the operation
    // can be applied to.
    this.baseLength = 0

    // The targetLength is the length of every string that results from applying
    // the operation on a valid input string.
    this.targetLength = 0
  }

  retain (n) {
    if (typeof n !== 'number') throw new Error("retain expects an integer")
    if (n === 0) return this

    this.baseLength += n
    this.targetLength += n
    const ops = this.ops
    if (isRetain(ops[ops.length - 1])) {
      // The last op is a retain op => we can merge them into one op.
      ops[ops.length - 1] += n;
    } else {
      // Create a new op.
      ops.push(n);
    }
    return this
  }

  insert (str) {
    if (typeof str !== 'string') throw new Error("insert expects a string")
    if (str === '') return this

    this.targetLength += str.length
    const ops = this.ops
    if (isInsert(ops[ops.length - 1])) {
      // Merge insert op.
      ops[ops.length - 1] += str
    } else if (isDelete(ops[ops.length - 1])) {
      // Attention! Insert doesn't influence future delete, nor does other way round,
      // thus the order of consecutive delete/insert in an operation doesn't matter
      // `delete(3), insert("something")` == `insert("something"), delete(3)`.
      // Here we enforce that in this case, the insert op always comes before delete.
      // This faciliate the implementaion of `equals()` method
      if (isInsert(ops[ops.length - 2])) {
        ops[ops.length - 2] += str
      } else { // next to last is retain
        const last = ops.pop()
        ops.push(str)
        ops.push(last)
      }
    } else {
      ops.push(str)
    }
    return this
  }

  delete (n) {
    if (typeof n === 'string') n = n.length
    if (typeof n !== 'number') throw new Error("delete expects an integer or a string")

    if (n === 0) return this
    const ops = this.ops
    if (n > 0) n = -n
    this.baseLength -= n
    if (isDelete(ops[ops.length - 1])) {
      ops[ops.length - 1] += n
    } else {
      ops.push(n)
    }
    return this
  }

  isNoop () {
    return this.ops.length === 0 || (this.ops.length === 1 && isRetain(this.ops[0]))
  }

  toString () {
    return this.ops.map(op => {
      if (isRetain(op)) {
        return `retain ${op}`
      } else if (isInsert(op)) {
        return `insert '${op}'`
      } else {
        return `delete ${-1 * op}`
      }
    }).join(', ')
  }

  toJSON () {
    return this.ops
  }

  apply (str) {
    const operation = this
    // @todo: the valid case might need to be that the version number meets
    if (str.length !== operation.baseLength) {
      throw new Error("The operation's base length must be equal to the string's length.")
    }

    let newStr = ''
    let strIndex = 0
    this.ops.forEach(op => {
      if (isRetain(op)) {
        if (strIndex + op > str.length) {
          throw new Error("Operation can't retain more characters than are left in the string.");
        }
        // Copy skipped part of the old string.
        newStr += str.slice(strIndex, strIndex + op)
        strIndex += op
      } else if (isInsert(op)) {
        newStr += op
      } else { // delete op
        // Delete is skip without copying.
        strIndex -= op
      }
    })
    if (strIndex !== str.length) {
      throw new Error("The operation didn't operate on the whole string.")
    }
    return newStr
  }

  // @note:
  // This method produces the inverse of this operation against some string
  // the `str` arg is required, since delete^{-1} is insert(someStr), but delete doesn't
  // note down the actual `someStr` deleted, need to get it base on `str`
  invert (str) {
    let strIndex = 0
    const inverse = new TextOperation()
    this.ops.forEach(op => {
      if (isRetain(op)) {
        inverse.retain(op)
        strIndex += op
      } else if (isInsert(op)) {
        inverse.delete(op.length)
      } else {
        inverse.insert(str.slice(strIndex, strIndex - op))
        strIndex -= op
      }
    })
    return inverse
  }

  // @note: key algorithm: ot.compose
  compose (operation2) {
    const operation1 = this
    // @todo: the valid case might need to be that the version number meets
    if (operation1.targetLength !== operation2.baseLength) {
      throw new Error("The base length of the second operation has to be the target length of the first operation")
    }
    const operation = new TextOperation() // the composed operation

    const ops1 = operation1.ops
    const ops2 = operation2.ops
    let i1 = 0, i2 = 0 // current index into ops1, ops2
    let op1 = ops1[i1++], op2 = ops2[i2++]; // current ops
    while (true) {
      // end condition: both ops1 and ops2 have been processed
      if (typeof op1 === 'undefined' && typeof op2 === 'undefined') break;

      if (isDelete(op1)) {
        operation.delete(op1)
        op1 = ops1[i1++]
        continue
      }
      if (isInsert(op2)) {
        operation.insert(op2)
        op2 = ops2[i2++]
        continue
      }

      if (typeof op1 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too short.")
      }
      if (typeof op2 === 'undefined') {
        throw new Error("Cannot compose operations: first operation is too long.")
      }

      // @note:
      // this part of the `compose()` algorithm I haven't yet figured out why...
      if (isRetain(op1) && isRetain(op2)) {
        if (op1 > op2) {
          operation.retain(op2);
          op1 = op1 - op2;
          op2 = ops2[i2++];
        } else if (op1 === op2) {
          operation.retain(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.retain(op1);
          op2 = op2 - op1;
          op1 = ops1[i1++];
        }
      } else if (isInsert(op1) && isDelete(op2)) {
        if (op1.length > -op2) {
          op1 = op1.slice(-op2);
          op2 = ops2[i2++];
        } else if (op1.length === -op2) {
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          op2 = op2 + op1.length;
          op1 = ops1[i1++];
        }
      } else if (isInsert(op1) && isRetain(op2)) {
        if (op1.length > op2) {
          operation.insert(op1.slice(0, op2));
          op1 = op1.slice(op2);
          op2 = ops2[i2++];
        } else if (op1.length === op2) {
          operation.insert(op1);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation.insert(op1);
          op2 = op2 - op1.length;
          op1 = ops1[i1++];
        }
      } else if (isRetain(op1) && isDelete(op2)) {
        if (op1 > -op2) {
          operation['delete'](op2);
          op1 = op1 + op2;
          op2 = ops2[i2++];
        } else if (op1 === -op2) {
          operation['delete'](op2);
          op1 = ops1[i1++];
          op2 = ops2[i2++];
        } else {
          operation['delete'](op1);
          op2 = op2 + op1;
          op1 = ops1[i1++];
        }
      } else {
        throw new Error(
          "This shouldn't happen: op1: " +
          JSON.stringify(op1) + ", op2: " +
          JSON.stringify(op2)
        );
      }
    }

    return operation
  }

  transform (operation) {
    return xform(this, operation)
  }

  // When you use ctrl-z to undo your latest changes, you expect the program not
  // to undo every single keystroke but to undo your last sentence you wrote at
  // a stretch or the deletion you did by holding the backspace key down. This
  // This can be implemented by composing operations on the undo stack. This
  // method can help decide whether two operations should be composed. It
  // returns true if the operations are consecutive insert operations or both
  // operations delete text at the same position. You may want to include other
  // factors like the time since the last change in your decision.
  shouldBeComposedWith (other) {
    if (this.isNoop() || other.isNoop()) { return true; }

    var startA = getStartIndex(this), startB = getStartIndex(other);
    var simpleA = getSimpleOp(this), simpleB = getSimpleOp(other);
    if (!simpleA || !simpleB) { return false; }

    if (isInsert(simpleA) && isInsert(simpleB)) {
      return startA + simpleA.length === startB;
    }

    if (isDelete(simpleA) && isDelete(simpleB)) {
      // there are two possibilities to delete: with backspace and with the
      // delete key.
      return (startB - simpleB === startA) || startA === startB;
    }

    return false
  }

  // Decides whether two operations should be composed with each other
  // if they were inverted, that is
  // `shouldBeComposedWith(a, b) = shouldBeComposedWithInverted(b^{-1}, a^{-1})`.
  shouldBeComposedWithInverted (other) {
    if (this.isNoop() || other.isNoop()) { return true; }

    var startA = getStartIndex(this), startB = getStartIndex(other);
    var simpleA = getSimpleOp(this), simpleB = getSimpleOp(other);
    if (!simpleA || !simpleB) { return false; }

    if (isInsert(simpleA) && isInsert(simpleB)) {
      return startA + simpleA.length === startB || startA === startB;
    }

    if (isDelete(simpleA) && isDelete(simpleB)) {
      return startB - simpleB === startA;
    }

    return false;
  }
}

export default TextOperation
