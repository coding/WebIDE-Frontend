import React, { PropTypes } from 'react'
import ModalContainer from 'components/Modal'
import Notification from 'components/Notification'
import DragAndDrop from 'components/DragAndDrop'
import { ContextMenuContainer } from 'components/ContextMenu'
import { inject } from 'mobx-react'
import store from './store'

const Utilities = ({ utilitiesExtensions }) => (
  <div className='utilities-container'>
    <ModalContainer />
    <Notification />
    <DragAndDrop />
    <ContextMenuContainer />
    {
        utilitiesExtensions
        .sort((labelA, labelB) => labelB.weight || 1 - labelA.weight || 1)
        .map(label => (
          <div key={label.viewId}>
            {store.extensions.views[label.viewId]}
          </div>
          ))
      }
  </div>
  )
Utilities.propTypes = {
  utilitiesExtensions: PropTypes.object
}

export default inject(() => ({
  utilitiesExtensions: store.extensions.labels.values()
  .filter(label => label.position === 'utilities')
}))(Utilities)
