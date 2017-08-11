import React, { Component } from 'react'
import EditorTabState from 'components/Tab/state'
import * as Modal from 'components/Modal/actions'
import { observer } from 'mobx-react'
import cx from 'classnames'
import modeInfos from 'components/Editor/components/CodeEditor/addons/mode/modeInfos'
import Menu from '../../Menu'
import i18n from 'utils/createI18n'

@observer
export default class LineWidget extends Component {
  constructor (props) {
    super(props)
  }

  handleGoto (defaultGoto) {
    Modal.showModal('Prompt', {
      message: i18n`file.goto`,
      defaultValue: defaultGoto,
      selectionRange: [0, defaultGoto.length]
    }).then((goto) => {
      const editor = EditorTabState.activeTab.editor
      editor.setCursor(goto)
      Modal.dismissModal()
    })
  }

  render () {
    const activeTab = EditorTabState.activeTab
    if (!activeTab) {
      return null
    }
    const { cursorPosition, selections } = activeTab.editor
    let lineText = ''
    const defaultGoto = `${cursorPosition.ln}:${cursorPosition.col}`
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
      <div className='status-bar-menu-item'
        onClick={e => { this.handleGoto(defaultGoto) }}
      >
        <span title='Click to goto line'>
          {lineText}
        </span>
      </div>
    )
  }
}
