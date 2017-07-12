import { xform } from './TextOperation'

// * Synchronized State *
// there is no pending operation that the client needs to send
// this is a singleton, indicating
class Synchronized {
  constructor () {
    if (Synchronized.singleton) return Synchronized.singleton
    Synchronized.singleton = this
    return this
  }

  applyClient (client, operation) {
    // When the user makes an edit, send the operation to the server and
    // switch to the 'AwaitingConfirm' state
    client.sendOperation(client.revision, operation)
    return new AwaitingConfirm(operation)
  }

  applyServer (client, operation) {
    // When we receive a new operation from the server, the operation can be
    // simply applied to the current document
    client.applyOperation(operation)
    return this
  }

  serverAck (client) {
    // shouldn't have been invoked at all, throw Error
    throw new Error("There is no pending operation.")
  }

  transformSelection (selection) {
    return selection // noop
  }
}

// * AwaitingConfirm State *
// cliend has sent one operation, and is waiting for server acknowledgement
class AwaitingConfirm {
  constructor (pending) {
    // Stash the pending operation
    this.pending = pending
  }

  applyClient (client, operation) {
    // In this state, when user makes an edit, don't send it immediately
    // instead we switch to 'AwaitingWithBuffer' state
    return new AwaitingWithBuffer(this.pending, operation)
  }

  applyServer (client, operation) {
    // In coming is another client's operation from server.
    //
    //                   /\
    // this.pending     /  \ other client operation
    //                 /    \
    //                 \    /
    //  pair[1]         \  / pair[0] (new pending)
    //  (can be applied  \/
    //  to the client's
    //  current document)
    const [pendingPrime, operationPrime] = xform(this.pending, operation)
    client.applyOperation(operationPrime)
    return new AwaitingConfirm(pendingPrime)
  }

  serverAck (client) {
    // The client's operation has been acknowledged
    // => switch back to synchronized state
    return new Synchronized()
  }

  transformSelection (selection) {
    return selection.transform(this.pending)
  }

  resend (client) {
    client.sendOperation(client.revision, this.pending)
  }
}

// * AwaitingWithBuffer State *
// like AwaitingConfirm, but also buffers local user edits
class AwaitingWithBuffer {
  constructor (pending, buffer) {
    // Stash the pending operation
    this.pending = pending
    this.buffer = buffer
  }

  applyClient (client, operation) {
    const newBuffer = this.buffer.compose(operation)
    return new AwaitingWithBuffer(this.pending, newBuffer)
  }

  applyServer (client, operation) {
    // Operation comes from another client
    //
    //                       /\
    //     this.pending     /  \ operation
    //                     /    \
    //                    /\    /    [pending', operation'] = xform(pending, operation)
    //     this.buffer   /  \* /      pending'
    //                  /    \/   * = operation'
    //                  \    /
    //                   \  /        [buffer', operation''] = xform(buffer, operation')
    //       operation''  \/   buffer'
    //
    //
    // the transformed operation that can be applied to the
    // client's current document is operation''

    const [pendingPrime, operationPrime] = xform(this.pending, operation)
    const [bufferPrime, operationPrimePrime] = xform(this.buffer, operationPrime)
    client.applyOperation(operationPrimePrime)
    return new AwaitingWithBuffer(pendingPrime, bufferPrime)
  }

  serverAck (client) {
    // shouldn't have been called, throw Error
    client.sendOperation(client.revision, this.buffer)
    return new AwaitingConfirm(this.buffer)
  }

  transformSelection (selection) {
    return selection.transform(this.pending).transform(this.buffer)
  }

  resend (client) {
    client.sendOperation(client.revision, this.pending)
  }
}

class Client {
  static Synchronized = Synchronized
  static AwaitingConfirm = AwaitingConfirm
  static AwaitingWithBuffer = AwaitingWithBuffer

  constructor (revision) {
    this.revision = revision
    this.state = new Synchronized()
  }

  setState (state) {
    this.state = state
  }

  // @invoked by EditorClient
  applyClient (operation) {
    this.setState(this.state.applyClient(this, operation))
  }

  // @registered by EditorClient
  // @invoked by serverAdapter event callbacks
  applyServer (revision, operation) {
    this.revision = revision // @fixme: probably should use another way to gen revision
    this.setState(this.state.applyServer(this, operation))
  }

  serverAck (revision) {
    this.revision = revision
    this.setState(this.state.serverAck(this))
  }
}

export default Client
