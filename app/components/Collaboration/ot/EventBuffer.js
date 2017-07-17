import { observable } from 'mobx'

class EventBuffer {
  constructor () {
    this.$buffer = observable.shallowArray()
    this.isBuffering = false

    this.dispose = this.$buffer.observe((change) => {
      // when consuming, stop reacting
      if (this.isConsuming) return
      // we only care about "added" case
      if (!change.added || change.added.length === 0) return
      // "added" is valide, but this is the case of `.sort()`, we don't want it either
      if (change.removed && change.removed.length > 0) return
      // when it's a valid case but we're buffering, we stop
      if (this.isBuffering) return

      // finally the case we want:
      this._consumeBuffer()
    })
  }

  push (item) {
    this.$buffer.push(item)
  }

  sort (sorter) {
    const sorted = this.$buffer.sort(sorter)
    this.$buffer.replace(sorted)
    return this
  }

  subscribe (handler) {
    this.handler = handler
  }

  _consumeBuffer () {
    this.isConsuming = true

    const snapshot = this.$buffer.toJS()
    snapshot.forEach(event => {
      this.handler(event, snapshot)
      this.$buffer.remove(event)
    })

    this.isConsuming = false
  }

  startBuffer () {
    this.isBuffering = true
  }

  stopBuffer () {
    this.isBuffering = false
    this._consumeBuffer()
  }
}

export default EventBuffer
