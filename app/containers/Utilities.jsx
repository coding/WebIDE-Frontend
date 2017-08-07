import React from 'react'
import ModalContainer from 'components/Modal'
import Notification from 'components/Notification'
import DragAndDrop from 'components/DragAndDrop'
import PluginArea from 'components/Plugins/component'
import { containers } from 'components/Plugins/constants'


const Utilities = () => (
  <div className='utilities-container'>
    <ModalContainer />
    <Notification />
    <DragAndDrop />
    <PluginArea position={containers.utilities} />
  </div>
  )

export default Utilities
