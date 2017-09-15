import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import ModeWidget from './ModeWidget'
import LineWidget from './LineWidget'

@inject(({ EditorTabState }) => {
  const activeTab = EditorTabState.activeTab
  if (!activeTab || !activeTab.editor) return { editor: null }
  return { editor: activeTab.editor }
})
@observer
class EditorWidgets extends Component {
  render () {
    const editor = this.props.editor
    if (!editor) return null
    return (
      <div className='status-bar-menu-item status-bar-editor-widgets'>
        <LineWidget editor={editor} />
        <ModeWidget editor={editor} />
      </div>
    )
  }
}

export default EditorWidgets
