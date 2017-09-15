import React, { Component } from 'react'
import * as Modal from 'components/Modal/actions'
import { observer } from 'mobx-react'
import cx from 'classnames'
import modeInfos from 'components/Editor/components/CodeEditor/addons/mode/modeInfos'
import Menu from 'components/Menu'
import i18n from 'utils/createI18n'
import { registerAction } from 'utils/actions'

@observer
export default class LineWidget extends Component {
  handleGoto = registerAction('editor:goto', () => {
    const editor = this.props.editor
    const { cursorPosition } = editor
    const defaultGoto = `${cursorPosition.ln}:${cursorPosition.col}`
    Modal.showModal('Prompt', {
      message: i18n`file.goto`,
      defaultValue: defaultGoto,
      selectionRange: [0, defaultGoto.length]
    }).then((goto) => {
      editor.setCursor(goto)
      Modal.dismissModal()
    })
  })

  render () {
    const editor = this.props.editor
    const { cursorPosition, selections } = editor
    let lineText = ''
    if (selections.length <= 1) {
      lineText = i18n`file.posInfo${{ ln: cursorPosition.ln, col: cursorPosition.col }}`
    } else {
      lineText = i18n`file.carets${{ length: selections.length }}`
      let selectionCount = 0
      selections.forEach((selection) => {
        selectionCount += selection.length
      })

      if (selectionCount > 0) {
        // lineText = `${lineText} (${selectionCount} characters selected)`
        lineText = i18n`file.totalSelected${{ length: selections.length, count: selectionCount }}`
      }
    }
    return (
      <div className='editor-widget'
        onClick={e => { this.handleGoto() }}
      >
        <span title='Click to goto line'>
          {lineText}
        </span>
      </div>
    )
  }
}
