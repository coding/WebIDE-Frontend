import React, { Component } from 'react'
import dispatchCommand from 'commands/dispatchCommand'

const keys = `{}()<>[]"';\/=+-:,.?&|!_\`$%*#@^~`

class VirtualKey extends Component {
  constructor(props) {
    super(props)
    this.keymap = ['Tab'].concat(keys.split(''))
  }

  emitterEvent(item) {
    dispatchCommand('highlight_line')
    const keyboardEvent = new KeyboardEvent('keypress', {bubbles:true}) 
    Object.defineProperty(keyboardEvent, 'charCode', 
      { get:() => this.charCodeVal }
    )

    keyboardEvent.charCodeVal = item.charCodeAt()
    // console.log(ke)
    document.querySelector('.monaco-editor').dispatchEvent(keyboardEvent)
  }

  render() {
   return <div style={{ zIndex: '100' }}>
      <ul className="virtual-keymap">
        {this.keymap.map(
          item => <li onClick={() => this.emitterEvent(item)}>{item}</li>
        )}
        <li><i className="fa fa-undo" /></li>
        <li><i className="fa fa-repeat" /></li>
      </ul>
    </div>
  }
}

export default VirtualKey
