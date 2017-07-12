const NORMAL_STATE = 'NORMAL_STATE'
const UNDOING_STATE = 'UNDOING_STATE'
const REDOING_STATE = 'REDOING_STATE'

function transformStack0 (stack, operation) {
  // try {
    const newStack = []
    stack = stack.slice() // duplica of original stack
    const xform = operation.constructor.transform
    while (stack.length) {
      const [stackedPrime, operationPrime] = xform(stack.pop(), operation)
      if (!stackedPrime.isNoop || !stackedPrime.isNoop()) newStack.push(stackedPrime)
      operation = operationPrime
    }
    return newStack.reverse()  // more performant than unshift
  // } catch (err) {
  //   console.trace(err)
  //   return []
  // }
}

function transformStack (stack, operation) {
  const newStack = []
  stack = stack.slice() // duplica of original stack
  const xform = operation.constructor.transform
  for (let i = stack.length - 1; i >= 0; i--) {
    const [stackedPrime, operationPrime] = xform(stack[i], operation)
    if (!stackedPrime.isNoop || !stackedPrime.isNoop()) {
      newStack.push(stackedPrime)
    }
    operation = operationPrime
  }

  return newStack.reverse()  // more performant than unshift
}

class UndoManager {
  constructor (maxItems) {
    this.maxItems = maxItems || 50
    this.state = NORMAL_STATE
    this.dontCompose = false
    this.undoStack = []
    this.redoStack = []
  }

  // add an operation to undo/redo stack, depending on current state
  // The operation added must be the inverse of the last edit.
  // When `shouldCompose` is true, compose the operation with the last operation,
  // unless the last operation was already pushed on the redo stack, or was
  // hidden by a newer operation on the undo stack

  // fixme:
  // It's crucial that one condition be met here.
  // incoming operation's targetLength MUST be equal to
  // previous operation's baseLength, BECAUSE undo ops are consumed in reverse order
  // if newer op's targetLength doesn't meet older's baseLength, it couldn't be applied anyway.
  add (operation, shouldCompose) {
    const undoStack = this.undoStack
    switch (this.state) {
      case UNDOING_STATE:
        this.redoStack.push(operation)
        this.dontCompose = true
        break
      case REDOING_STATE:
        undoStack.push(operation)
        this.dontCompose = true
        break
      case NORMAL_STATE:
      default:
        // operation.wrapped.targetLength

        if (!this.dontCompose && shouldCompose && undoStack.length > 0) {
          undoStack.push(operation.compose(undoStack.pop()))
        } else {
          undoStack.push(operation)
          if (undoStack.length > this.maxItems) undoStack.shift()
        }
        this.dontCompose = false
        this.redoStack = []
    }
  }

  // Transform the local undo/redo stacks against a operation from another client
  transform (operation) {
    this.undoStack = transformStack(this.undoStack, operation)
    this.redoStack = transformStack(this.redoStack, operation)
  }

  // Perform an undo by calling a function `fn` with the latest operation on the undo
  // stack. `fn` is expected to apply the operation, then return the inverse
  // of the operation, which pushes the inverse on the redo stack.
  performUndo (fn) {
    this.state = UNDOING_STATE
    if (this.undoStack.length === 0) return /* noop */
    const inverseOp = fn(this.undoStack.pop())
    this.add(inverseOp)
    this.state = NORMAL_STATE
  }

  // The inverse of `performUndo`.
  performRedo (fn) {
    this.state = REDOING_STATE
    if (this.redoStack.length === 0) return /* noop */
    const inverseOp = fn(this.redoStack.pop())
    this.add(inverseOp)
    this.state = NORMAL_STATE
  }

  // @fixme:
  // Following state checking methods seem useless, will see...
  canUndo () {
    return this.undoStack.length !== 0
  }

  canRedo () {
    return this.redoStack.length !== 0
  }

  isUndoing () {
    return this.state === UNDOING_STATE
  }

  isRedoing () {
    return this.state === REDOING_STATE
  }
}

export default UndoManager
