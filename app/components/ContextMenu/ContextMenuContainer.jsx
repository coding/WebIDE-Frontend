import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { action } from 'mobx'
import ContextMenu from './ContextMenu'
import state from './state'
import store from './store'

const ContextMenuContainer = observer(() => {
  return (
    <ContextMenu
      items={state.items}
      isActive={state.isActive}
      pos={state.pos}
      context={state.contextNode}
      deactivate={store.closeContextMenu}
    />
  )
})

export default ContextMenuContainer
