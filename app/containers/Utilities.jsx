import React from 'react'
import ModalContainer from 'components/Modal'
import DragAndDrop from 'components/DragAndDrop'
import { Tooltips } from 'components/Tooltip'
import PluginArea from 'components/Plugins/component'
import { CONTAINERS } from 'components/Plugins/constants'
import { ContextMenuContainer } from 'components/ContextMenu'
import Mask from 'components/Mask'

const Utilities = () => (
  <div className='utilities-container'>
    <Tooltips />
    <ModalContainer />
    <DragAndDrop />
    <ContextMenuContainer />
    <PluginArea position={CONTAINERS.UTILITIES} />
    <Mask />
  </div>
)

export default Utilities
