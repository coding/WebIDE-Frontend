import Client from './Client'
import Selection from './Selection'
import UndoManager from './UndoManager'
import WrappedOperation from './WrappedOperation'
import CodeMirrorAdapter from './CodeMirrorAdapter'
import ServerAdapter from './ServerAdapter'
import config from 'config'
import { hueFromString } from 'utils/colors'
import state from '../state'
import { autorun } from 'mobx'
import { isFunction } from 'utils/is'

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
  constructor ({ id, name, editorAdapter, selection, avatar }) {
    this.id = id
    this.name = name
    this.avatar = avatar
    this.editorAdapter = editorAdapter

    this.hue = name ? hueFromString(name) : Math.random() * 360
    if (selection) this.updateSelection(selection)
  }

  setName (name) {
    if (this.name === name) return
    this.name = name
    this.hue = hueFromString(name)
  }

  updateSelection (selection) {
    this.removeSelection()
    this.selection = selection
    this.mark = this.editorAdapter.setOtherSelection(
      selection,
      this.hue,
      this.name
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
    this.serverAdapter = new ServerAdapter(filePath, { version: revision.version })
    editor.otClient = this
    this.clientId = this.serverAdapter.clientId
    this.undoManager = new UndoManager()
    this.clients = {}

    this.disposers = []
    this.disposers.push(autorun(() => {
      this.initializeClients(state.collaborators.reduce((acc, { clientIds, collaborator }) => {
        clientIds.forEach((clientId) => {
          acc[clientId] = {
            clientId,
            name: collaborator.name,
            avatar: collaborator.avatar,
          }
        })
        return acc
      }, {}))
    }))

    this.editorAdapter.registerCallbacks({
      change: (operation, inverse) => {
        this.onChange(operation, inverse)
      },
      selectionChange: () => { this.onSelectionChange() },
      blur: () => this.onBlur(),
    })
    this.editorAdapter.registerUndo(() => this.undo())
    this.editorAdapter.registerRedo(() => this.redo())

    this.disposers.push(this.serverAdapter.registerCallbacks({
      operation: (data) => {
        console.log('[ops]', data)
        this.applyServer(data.revision, data.textOperation)
      },
      ack: (data) => {
        console.log('[ack]', data)
        this.serverAck(data.revision)
      },
      selections: ({ clientId, selections: ranges }) => {
        if (ranges) {
          this.getClientObject(clientId).updateSelection(
            this.transformSelection(Selection.fromJSON(ranges))
          )
        } else {
          this.getClientObject(clientId).removeSelection()
        }
      }
    }))
  }

  destroy () {
    this.disposers.forEach(disposer => isFunction(disposer) && disposer())
  }

  addClient ({ clientId, name, selection, avatar }) {
    if (this.clients[clientId]) return
    this.clients[clientId] = new OtherClient({
      editorAdapter: this.editorAdapter,
      id: clientId,
      avatar,
      name: name || clientId,
      selection: selection ? Selection.fromJSON(selection) : null
    })
  }

  initializeClients (clients) {
    if (!this.clients) this.clients = {}
    Object.values(clients).forEach(clientConfig =>
      this.addClient(clientConfig)
    )
  }

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
    const client = this.clients[clientId]
    if (!client) return
    client.destroy()
    delete this.clients[clientId]
  }

  // by protocol of UndoManager, this method is required to return an inverse operation
  applyUndoOrRedo (operation) {
    const inverse = operation.invert(this.editorAdapter.getValue())
    this.editorAdapter.applyOperation(operation.wrapped)
    this.selection = operation.meta.selectionAfter
    this.editorAdapter.setSelection(this.selection)
    this.applyClient(operation.wrapped)
    return inverse
  }

  save () {
    this.serverAdapter.sendSaveSignal(this.revision, this.filePath)
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
