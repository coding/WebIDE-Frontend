import Client from './Client'
import Selection from './Selection'
import UndoManager from './UndoManager'
import WrappedOperation from './WrappedOperation'
import CodeMirrorAdapter from './CodeMirrorAdapter'
import ServerAdapter from './ServerAdapter'
import config from 'config'
import { hueFromName, hsl2hex } from './helpers'

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

class EditorClient extends Client {
  constructor (editor) {
    const { revision, cm, filePath } = editor
    super(revision)
    this.filePath = filePath
    this.editorAdapter = new CodeMirrorAdapter(cm)
    this.serverAdapter = new ServerAdapter(filePath, revision)
    editor.otClient = this
    this.clientId = this.serverAdapter.clientId
    this.undoManager = new UndoManager()
    this.clients = {}

    window.editorClient = this

    this.editorAdapter.registerCallbacks({
      change: (operation, inverse) => {
        this.onChange(operation, inverse)
      },
      selectionChange: () => { this.onSelectionChange() },
      blur: () => this.onBlur(),
    })
    this.editorAdapter.registerUndo(() => this.undo())
    this.editorAdapter.registerRedo(() => this.redo())

    this.serverAdapter.registerCallbacks({
      operation: (data) => {
        if (data.path !== this.filePath) return
        console.log('[ops]', data)
        this.applyServer(data.revision, data.textOperation)
      },
      ack: (data) => {
        if (data.path !== this.filePath) return
        console.log('[ack]', data)
        this.serverAck(data.revision)
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
    // this.serverAdapter.sendSaveSignal(this.revision, this.filePath)
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
    // const operation = new WrappedOperation(textOperation, meta)
    const undoStackLength = this.undoManager.undoStack.length
    const lastUndoOperation = this.undoManager.undoStack[undoStackLength - 1]
    const shouldCompose = undoStackLength > 0 &&
      inverse.shouldBeComposedWithInverted(lastUndoOperation.wrapped)
    const inverseMeta = new SelfMeta(selectionAfter, selectionBefore)
    const wrappedInverse = new WrappedOperation(inverse, inverseMeta)
    this.undoManager.add(wrappedInverse, shouldCompose)
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

  // @invoked by Client
  sendOperation (revision, operation) {
    const operationData = {
      author: config.globalKey,
      clientId: this.clientId,
      filePath: this.filePath,
      targetVersion: revision,
      textOperation: operation,
    }
    this.serverAdapter.sendOperation(revision, operationData, this.selection)
  }

  // @invoked by Client
  applyOperation (operation) {
    this.editorAdapter.applyOperation(operation)
    this.updateSelection()
    this.undoManager.transform(new WrappedOperation(operation, null))
  }
}

export default EditorClient
