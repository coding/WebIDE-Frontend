import Client from './Client'
import Selection from './Selection'
import UndoManager from './UndoManager'
import WrappedOperation from './WrappedOperation'
import CodeMirrorAdapter from './CodeMirrorAdapter'
import ServerAdapter from './ServerAdapter'
import { isRetain, isInsert, isDelete } from './TextOperation'

function rgb2hex (r, g, b) {
  function digits (n) {
    var m = Math.round(255*n).toString(16);
    return m.length === 1 ? '0'+m : m;
  }
  return '#' + digits(r) + digits(g) + digits(b);
}

function hsl2hex (h, s, l) {
  if (s === 0) { return rgb2hex(l, l, l); }
  var var2 = l < 0.5 ? l * (1+s) : (l+s) - (s*l);
  var var1 = 2 * l - var2;
  var hue2rgb = function (hue) {
    if (hue < 0) { hue += 1; }
    if (hue > 1) { hue -= 1; }
    if (6*hue < 1) { return var1 + (var2-var1)*6*hue; }
    if (2*hue < 1) { return var2; }
    if (3*hue < 2) { return var1 + (var2-var1)*6*(2/3 - hue); }
    return var1;
  };
  return rgb2hex(hue2rgb(h+1/3), hue2rgb(h), hue2rgb(h-1/3));
}

function hueFromName (name) {
  var a = 1;
  for (var i = 0; i < name.length; i++) {
    a = 17 * (a+name.charCodeAt(i)) % 360;
  }
  return a/360;
}


class SelfMeta {
  constructor (selectionBefore, selectionAfter) {
    this.selectionBefore = selectionBefore
    this.selectionAfter = selectionAfter
  }

  invert () {
    return new this.constructor(this.selectionAfter, this.selectionBefore)
  }

  compose (other) {
    return new this.constructor(this.selectionBefore, other.selectionAfter)
  }

  transform (operation) {
    return new this.constructor(
      this.selectionBefore.transform(operation),
      this.selectionAfter.transform(operation)
    )
  }
}

class OtherMeta {
  static fromJSON = function (obj) {
    return new OtherMeta(
      obj.clientId,
      obj.selection && Selection.fromJSON(obj.selection)
    )
  }

  constructor (clientId, selection) {
    this.clientId = clientId
    this.selection = selection
  }

  transform (operation) {
    return new this.constructor(
      this.clientId,
      this.selection && this.selection.transform(operation)
    )
  }
}


// this dude is managing other client's indicators: name, selection, color.
class OtherClient {
  constructor ({ id, name, editorAdapter, selection }) {
    this.id = id
    this.name = name
    this.editorAdapter = editorAdapter

    this.setColor(name ? hueFromName(name) : Math.random())
    if (selection) this.updateSelection(selection)
  }

  setColor (hue) {
    this.hue = hue
    this.color = hsl2hex(hue, 0.75, 0.5)
    this.lightColor = hsl2hex(hue, 0.5, 0.9)
  }

  setName (name) {
    if (this.name === name) return
    this.name = name
    this.setColor(hueFromName(name))
  }

  updateSelection (selection) {
    this.removeSelection()
    this.selection = selection
    this.mark = this.editorAdapter.setOtherSelection(
      selection,
      selection.position === selection.selectionEnd ? this.color : this.lightColor,
      this.id
    )
  }

  removeSelection () {
    if (this.mark) {
      this.mark.clear()
      this.mark = null
    }
  }

  destroy () {
    this.removeSelection()
    // and other cleanup
  }
}


function decodeOperationFromServer (_ops) {
  const ops = _ops.map(op => {
    switch (op.type) {
      case 'RETAIN':
        return Number(op.content)
      case 'CHARACTERS':
        return op.content
      case 'DELETE_CHARACTERS':
        return op.content.length * -1
    }
  })
  return ops
}

class EditorClient extends Client {
  constructor (editor) {
    const { revision, cm, filePath } = editor
    super(revision)
    this.editorAdapter = new CodeMirrorAdapter(cm)
    this.serverAdapter = new ServerAdapter()
    editor.otClient = this
    this.clientId = this.serverAdapter.id
    this.filePath = filePath
    this.undoManager = new UndoManager()
    this.clients = {}

    this.editorAdapter.registerCallbacks({
      change: (operation, inverse) => {
        console.log('this.editorAdapter.onchange')
        this.onChange(operation, inverse)
      },
      selectionChange: () => { this.onSelectionChange() },
      blur: () => this.onBlur(),
    })
    this.editorAdapter.registerUndo(() => this.undo())
    this.editorAdapter.registerRedo(() => this.redo())

    this.serverAdapter.registerCallbacks({
      operation: function (data) {
        console.log('operation from server', data)
        this.applyServer(data.resultingVersion, decodeOperationFromServer(data.ops))
      },
      ack: function (data) {
        console.log('ackownledge from server', data)
        this.serverAck(data.resultingVersion)
      }
    })
  }

  addClient (clientId, { name, selection }) {
    this.clients[clientId] = new OtherClient({
      id: clientId,
      editorAdapter: this.editorAdapter,
      name: name || clientId,
      selection: selection ? Selection.fromJSON(selection) : null
    })
  }

  save () {
    this.serverAdapter.sendSaveSignal(this.revision, this.filePath)
  }

  initializeClients (clients) { /**/ }

  getClientObject (clientId) {
    const client = this.clients[clientId]
    if (client) return client
    return this.clients[clientId] = new OtherClient({
      id: clientId,
      name: clientId,
      editorAdapter: this.editorAdapter,
    })
  }

  onClientLeft (clientId) {
    const client = this.clients[clientId];
    if (!client) return
    client.destroy()
    delete this.clients[clientId]
  }

  initializeClientList () { /**/ }

  // by protocol of UndoManager, this method is required to return an inverse operation
  applyUndoOrRedo (operation) {
    const inverse = operation.invert(this.editorAdapter.getValue())
    this.editorAdapter.applyOperation(operation.wrapped)
    this.selection = operation.meta.selectionAfter
    this.editorAdapter.setSelection(this.selection)
    this.applyClient(operation.wrapped)
    return inverse
  }

  undo () {
    this.undoManager.performUndo(o => this.applyUndoOrRedo(o))
  }

  redo () {
    this.undoManager.performRedo(o => this.applyUndoOrRedo(o))
  }

  onChange (textOperation, inverse) {
    const selectionBefore = this.selection
    this.updateSelection()
    const selectionAfter = this.selection
    const meta = new SelfMeta(selectionBefore, selectionAfter)
    const operation = new WrappedOperation(textOperation, meta)
    const undoStackLength = this.undoManager.undoStack.length
    const lastUndoOperation = this.undoManager.undoStack[undoStackLength - 1]
    const compose = undoStackLength > 0 &&
      inverse.shouldBeComposedWithInverted(lastUndoOperation.wrapped)
    const inverseMeta = new SelfMeta(selectionAfter, selectionBefore)
    this.applyClient(textOperation)
  }

  updateSelection () {
    this.selection = this.editorAdapter.getSelection()
  }

  onSelectionChange () {
    var oldSelection = this.selection
    this.updateSelection()
    if (oldSelection && this.selection.equals(oldSelection)) return
    this.sendSelection(this.selection)
  }

  onBlur () {
    this.selection = null
    this.sendSelection(null)
  }

  sendSelection (selection) {
    if (this.state instanceof Client.AwaitingWithBuffer) return
    this.serverAdapter.sendSelection(selection)
  }

  sendOperation (revision, operation) {
    const operationMessage = encodeOperationForServer(this.clientId, this.filePath, revision, operation)
    console.log('EditorClient.sendOperation', operationMessage)
    this.serverAdapter.sendOperation(revision, JSON.stringify(operationMessage), this.selection)
  }

  applyOperation (operation) {
    this.editorAdapter.applyOperation(operation)
    this.updateSelection()
    this.undoManager.transform(new WrappedOperation(operation, null))
  }

}

function encodeOperationForServer (clientId, filePath, targetVersion, textOperation) {
  const ops = textOperation.ops.map(op => {
    if (isRetain(op)) {
      return {
        type: 'RETAIN',
        content: String(op),
      }
    } else if (isInsert(op)) {
      return {
        type: 'CHARACTERS',
        content: op,
      }
    } else if (isDelete(op)) {
      let nonsenseString = ''
      while (op < 0) {
        nonsenseString += '_'
        op++
      }
      return {
        type: 'DELETE_CHARACTERS',
        content: nonsenseString,
      }
    }
  })

  return {
    path: filePath,
    author: config.globalKey || 'foobar',
    clientId,
    targetVersion,
    ops,
  }
}

function decodeOperationFromServer (operationMessage) {
  const {
    spaceKey,
    path,
    author,
    resultingVersion,
    clientId,
  } = operationMessage

  const ops = operationMessage.ops.map(op => {
    switch (op.type) {
      case 'RETAIN':
        return Number(op.content)
      case 'CHARACTERS':
        return op.content
      case 'DELETE_CHARACTERS':
        return op.content.length * -1
    }
  })
  return { clientId, ops, path }
}

export default EditorClient
