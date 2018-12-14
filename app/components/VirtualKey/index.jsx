import React, { Component } from 'react'
import editorState from '../MonacoEditor/state'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

const keys = `{}()<>[]"';\/=+-:,.?&|!_\`$%*#@^~`
const state = observable({
  show: false
})

class VirtualKey extends Component {
  constructor(props) {
    super(props)
    this.keymap = ['Tab'].concat(keys.split(''))
  }

  emitterEvent(item) {
    const monacoEditor = editorState.activeMonacoEditor
    if (!monacoEditor) return

    if (item === 'Tab') {
      item = '\t'
    }

    if (item === 'undo') {
      monacoEditor.trigger('', 'undo')
      return
    }

    if (item === 'redo') {
      monacoEditor.trigger('', 'redo')
      return
    }

    monacoEditor.trigger('', 'type', { text: item })
    // Insert pair symbols
    let nextSymbol = ''
    switch (item) {
      case '{': nextSymbol = '}'; break
      case '(': nextSymbol = ')'; break
      case '[': nextSymbol = ']'; break
      case '"': nextSymbol = '"'; break
      case `'`: nextSymbol = `'`; break
      case '`': nextSymbol = '`'; break
      default: break
    }

    monacoEditor.trigger('', 'type', { text: nextSymbol })
    if (nextSymbol) {
      const position = monacoEditor.cursor.getPosition()
      monacoEditor.setPosition({
        lineNumber : position.lineNumber, column: position.column - 1
      })
    }
  }

  render() {
   return <div className={'virtual-container'}
               style={{ display: state.show ? 'flex' : 'none' }}>
      <ul className="virtual-keymap">
        {this.keymap.map(
          item => <li onClick={() => this.emitterEvent(item)}>{item}</li>
        )}
      </ul>
      <div className="icons">
        <div onClick={() => this.emitterEvent('undo')}>
          <i className="fa fa-undo" />
        </div>
        <div onClick={() => this.emitterEvent('redo')}>
          <i className="fa fa-repeat" />
        </div>
        <div onClick={() => state.show = false}>
          <i className="fa fa-times" />
        </div>
      </div>
    </div>
  }
}

export default observer(VirtualKey)
export { state }
