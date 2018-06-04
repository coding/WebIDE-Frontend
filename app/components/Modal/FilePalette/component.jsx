import _ from 'lodash'
import React, { Component } from 'react'
import icons from 'file-icons-js';
import api from '../../../backendAPI'
import store, { dispatch as $d } from '../../../store'
import * as TabActions from 'components/Tab/actions'
import cx from 'classnames'
import dispatchCommand from 'commands/dispatchCommand'
import i18n from 'utils/createI18n';

const debounced = _.debounce(function (func) { func() }, 1000)

class FilePalette extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      inputValue: '',
      selectedItemIndex: 0,
      includeNonProjectItems: false
    }
    this.handleExcludeChange = this.handleExcludeChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.searchFiles = this.searchFiles.bind(this)
    this.openFile = this.openFile.bind(this)
  }

  handleExcludeChange (e) {
    this.setState({
      includeNonProjectItems: e.target.checked
    })
    debounced(this.searchFiles)
  }

  handleInputChange (e) {
    this.setState({
      inputValue: e.target.value
    })
    debounced(this.searchFiles)
  }

  searchFiles () {
    const value = this.state.inputValue
    api.searchFile(value, this.state.includeNonProjectItems)
    .then((res) => {
      this.setState({
        items: res
      })
    })
  }

  openFile (itemIdx) {
    let node
    if (itemIdx) {
      node = this.state.items[itemIdx]
    } else {
      node = this.state.items[this.state.selectedItemIndex]
    }
    if (!node) {
      return
    }
    let splitPattern = /\/(.*\/)?(.*)/
    let matches = node.path.match(splitPattern)
    let directory
    if (matches[1]) {
      directory = "#{config.projectName}/#{_.trimEnd(matches[1], '/')}"
    }

    let filename = matches[2]

    dispatchCommand('file:open_file', node.path)
    dispatchCommand('modal:dismiss')
  }

  renderIcon(item) {
    const arr = item.path.split('/');
    return icons.getClassWithColor(arr[arr.length - 1]) || 'fa fa-file-text-o';
  }

  renderItem (item, itemIdx) {
    if (this.state.inputValue === '') return <i>{item.path}</i>
    const that = this
    var itemElements = item.path.split('').map( (char, idx) => {
      return (this.state.inputValue.toLowerCase().indexOf(char) > -1 || this.state.inputValue.toUpperCase().indexOf(char) > -1)
        ? <em key={idx}>{char}</em>
        : <i key={idx}>{char}</i>
    })
    return itemElements
  }

  render () {
    const { items, selectedItemIndex, includeNonProjectItems } = this.state;
    return (
      <div className="modal-content">
        <input
          type="text"
          className="form-control command-palette-input"
          onChange={this.handleInputChange}
          autoFocus
          onKeyDown={this._onKeyDown}
        />
        <input
          type="checkbox"
          id="includeNonProjectItems"
          checked={includeNonProjectItems}
          onChange={this.handleExcludeChange}
        />
        <label htmlFor="includeNonProjectItems">
          Include non-project items
        </label>
        <div className="command-palette-board">
          <ul className='command-palette-items'>
            {
              items.map((item, itemIdx) =>
                <li className={cx({ selected: itemIdx == selectedItemIndex })}
                  onClick={e => this.openFile(itemIdx)}
                  key={itemIdx} >
                  <i className={`icon ${this.renderIcon(item)}`}></i>
                  {this.renderItem(item, itemIdx)}
                </li>
              )
            }
          </ul>
        </div>
      </div>
    )
  }

  _onKeyDown = e => {
    var idx = this.state.selectedItemIndex
    var len = this.state.items.length

    switch (e.keyCode) {
      case 13: /* enter */
        this.openFile()
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

export default FilePalette
