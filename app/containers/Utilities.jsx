import React from 'react'
import ModalContainer from 'components/Modal'
import Notification from 'components/Notification'
import DragAndDrop from 'components/DragAndDrop'
import PluginArea from 'components/Plugins/component'
import { CONTAINERS } from 'components/Plugins/constants'
import { ContextMenuContainer } from 'components/ContextMenu'


const Utilities = () => (
  <div className='utilities-container'>
    <ModalContainer />
    <Notification />
    <DragAndDrop />
    <ContextMenuContainer />
    <PluginArea position={CONTAINERS.UTILITIES} />
  </div>
  )

export default Utilities
