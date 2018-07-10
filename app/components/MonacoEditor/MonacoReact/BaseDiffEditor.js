import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import * as monaco from 'monaco-editor'

import initialOptions from '../monacoDefaultOptions'
import { findLanguageByextensions } from '../utils/findLanguage'

class BaseDiffEditor extends PureComponent {
  static propTypes = {
    original: PropTypes.string,
    modified: PropTypes.string,
    path: PropTypes.string,
  }

  constructor (props) {
    super(props)
    const { original, modified, path } = props
    const fileExt = path.split('.').pop()
    this.language = findLanguageByextensions(fileExt) ? findLanguageByextensions(fileExt).id : ''
    this.original = original
    this.modified = modified
    this.path = path
    this.diffEditor = null
    this.originalModel = null
    this.modifiedModel = null
  }

  componentDidMount () {
    if (this.diffElement) {
      const { original, modified } = this
      this.originalModel = monaco.editor.createModel(original, this.language)
      this.modifiedModel = monaco.editor.createModel(modified, this.language)
      this.diffEditor = monaco.editor.createDiffEditor(this.diffElement, {
        ...initialOptions,
        language: this.language,
        enableSplitViewResizing: false,
        renderSideBySide: false,
        readOnly: true,
      })
      this.diffEditor.setModel({
        original: this.originalModel,
        modified: this.modifiedModel,
      })
    }
  }

  render () {
    return (
      <div
        ref={ele => this.diffElement = ele}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }
}

export default BaseDiffEditor

