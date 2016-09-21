import React, { Component } from 'react'
import { getPaletteItems } from './commandPalette'
import cx from 'classnames'

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
          ref={r=>this.input=r}
          onChange={ e=>this.setState({items: getPaletteItems(e.target.value)}) }
          onKeyDown={this.onKeyDown}
        />
        <ul className='command-palette-items'>
          {this.state.items.map( (item, itemIdx) =>
            <li className={cx({selected: itemIdx == this.state.selectedItemIndex})}
              key={itemIdx}>{ this.renderItem(item, itemIdx) }</li>
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

  onKeyDown = e => {
    var idx = this.state.selectedItemIndex
    var len = this.state.items.length
    if (e.keyCode == 40 /* down */) {
      if (++idx == len) idx = len - 1
      this.setState({selectedItemIndex:idx})
    } else if (e.keyCode == 38 /* up */) {
      if (--idx < 0) idx = 0
      this.setState({selectedItemIndex:idx})
    }
  }
}

export default CommandPalette
