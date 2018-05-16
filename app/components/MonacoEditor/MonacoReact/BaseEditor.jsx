import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { measure } from '@pinyin/measure'
import * as monaco from 'monaco-editor'

import dispatchCommand from 'commands/dispatchCommand'

function noop () {}

const Div = measure('div')
const debounced = debounce(func => func(), 1000)


class MonacoEditor extends React.Component {
  constructor (props) {
    super(props)

    const { editorInfo } = props
    this.editor = editorInfo
    this.editorElement = editorInfo.monacoElement
    this.containerElement = undefined
    this.currentValue = props.value
  }

  componentDidMount () {
    if (!this.containerElement) return
    this.containerElement.appendChild(this.editorElement)
    const { monacoEditor } = this.editor
    monacoEditor.onDidChangeModelContent((event) => {
      const value = monacoEditor.getValue()

      this.currentValue = value

      // if (!this.__prevent_trigger_change_event) {
      //   this.props.onChange(value, event)
      // }

      // debounced(() => {
      //   dispatchCommand('file:save_monaco', this.currentValue)
      // })
    })
   
  }


  // componentWillUnmount () {
  //   this.destroyMonaco()
  // }

  handleResize = () => {
    if (!this.editor.monacoEditor) return
    this.editor.monacoEditor.layout()
  }

  destroyMonaco () {
    if (typeof this.editor !== 'undefined') {
      this.editor.dispose()
    }
  }

  assignRef = (component) => {
    this.containerElement = component
  }

  render () {
    const { width, height } = this.props
    const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`
    const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`
    const style = {
      width: fixedWidth,
      height: fixedHeight
    }

    return (<Div
      style={{ width: '100%', height: '100%' }}
      onWidthChange={this.handleResize}
      onHeightChange={this.handleResize}
    >
      <div className='react-monaco-editor-container' ref={this.assignRef} style={style} />
    </Div>)
  }
}

MonacoEditor.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.string,
}

MonacoEditor.defaultProps = {
  width: '100%',
  height: '100%',
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: null,
  options: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop,
  requireConfig: {}
}

export default MonacoEditor
