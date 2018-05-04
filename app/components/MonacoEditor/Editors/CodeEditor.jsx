import React, { Component } from 'react'

import MonacoEditor from '../MonacoReact/BaseEditor'


class CodeEditor extends Component {

  onChange = () => {

  }

  editorDidMount = (editor, monaco) => {
    // console.log('?')
  }

  render () {
    const options = {
      selectOnLineNumbers: true,
      renderCharacters: false,
      minimap: {
        enabled: true,
      }
    }

    return (
      <MonacoEditor
        width='100%'
        height='100%'
        language={this.props.editor.modeInfo.name.toLocaleLowerCase()}
        theme='vs-dark'
        value={this.props.editor.file.content}
        options={options}
        onChange={this.onChange}
        // requireConfig={requireConfig}
        editorDidMount={this.editorDidMount}
        editorWillMount={(monaco) => {
          // console.log('?')
        }}
      />
    )
  }
}

export default CodeEditor
