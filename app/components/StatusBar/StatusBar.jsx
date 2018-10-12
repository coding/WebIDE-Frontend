import React from 'react'
import { GitBranchWidget } from 'components/Git'
import { dispatchCommand } from 'commands'
import { EditorWidgets } from 'components/Editor'
import { observer } from 'mobx-react'
import languageState from 'components/MonacoEditor/LanguageClientState'
import PluginArea from 'components/Plugins/component'
import { STATUSBAR } from 'components/Plugins/constants'
import configState from '../../config'
import UploadWidgets from './UploadWidgets'
import state from './state'

const StatusBar = observer(({ messages=[] }) => {
  return (
    <div className='status-bar'>
      <div className='status-widget-container left'>
        <div className='status-bar-menu-item toggle-layout fa fa-desktop' onClick={e => dispatchCommand('view:toggle_bars')} ></div>
        <div className='status-bar-space-key'>{configState.spaceKey}</div>
        <div className='status-bar-space-key'>{languageState.message}</div>
      </div>
      <UploadWidgets />
      <div className='status-messages'>
        {messages.map(message => <div className='status-message'>{message}</div>)}
      </div>
      {state.displayBar && <div className='status-progress'>
        <span></span>
      </div>}
      <PluginArea className='status-bar-plugin-area' position={STATUSBAR.WIDGET} />
      <div className='status-widget-container right'>
        <EditorWidgets />
        <GitBranchWidget ref={com => window.refs.GitBranchWidget = com}
        /></div>
    </div>
  )
})

export default StatusBar
