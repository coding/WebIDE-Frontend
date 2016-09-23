/* @flow weak */
import React, { Component } from 'react'
import getPaletteItems from './getPaletteItems'
import cx from 'classnames'

import {dispatchCommand} from '../lib/keymapper'

class CommandPalette extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: getPaletteItems(),
      selectedItemIndex: 0
    }
  }

  render() {
    return (
      <div className='modal-content'>
        <input type='text'
          className='command-palette-input'
          autoFocus={true}
          onChange={ e=>this.setState({items: getPaletteItems(e.target.value)}) }
          onKeyDown={this._onKeyDown}
        />
        <ul className='command-palette-items'>
          {this.state.items.map( (item, itemIdx) =>
            <li className={cx({selected: itemIdx == this.state.selectedItemIndex})}
              onClick={e=>this._dispatchCommand(itemIdx)}
              key={itemIdx} >{ this.renderItem(item, itemIdx) }</li>
          )}
        </ul>
      </div>
    )
  }

  renderItem (item, itemIdx) {
    if (!item.em) return <i>{item.name}</i>
    var itemElements = item.name.split('').map( (char, idx) => {
      return item.em.indexOf(idx) > -1
        ? <em key={idx}>{char}</em>
        : <i key={idx}>{char}</i>
    })
    return itemElements
  }

  _dispatchCommand (itemIdx) {
    var idx = itemIdx? itemIdx : this.state.selectedItemIndex
    dispatchCommand(this.state.items[idx]['command'])
  }

  _onKeyDown = e => {
    var idx = this.state.selectedItemIndex
    var len = this.state.items.length

    switch (e.keyCode) {
      case 13: /* enter */
        this._dispatchCommand()
        break
      case 40: /* down */
        if (++idx == len) idx = len - 1
        this.setState({selectedItemIndex:idx})
        break
      case 38: /* up */
        if (--idx < 0) idx = 0
        this.setState({selectedItemIndex:idx})
        break
    }
  }
}

export default CommandPalette
