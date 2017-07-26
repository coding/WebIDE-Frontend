import { PropTypes } from 'react'
import _ from 'lodash'
import PaneScope from 'commons/Pane/state'
import { extendObservable, observable, computed, action, autorun, autorunAsync, runInAction } from 'mobx'

const { state, BasePane } = PaneScope()

/*
* side bar state shape
  sidePanelViews: {
      left: {
          //  sideBar label
          [key]: {
            key,
            viewId,  current viewid, the view
            text,    current text
            icon,
            onSidebarActive: func,
            onSidebarDeactive: func,
            weight: number // the order
           },
      },
      right: {},
      bottom: {}
  }
  views {
      [key]: {view} componnet
  }
*/
// shapes
export const labelShape = {
  text: PropTypes.string,
  icon: PropTypes.string,
  viewId: String,
}

export const labelsShape = PropTypes.shape(({
  left: labelShape,
  right: labelShape,
  bottom: labelShape
}))

extendObservable(state, {
  get panels () { return this.entities },
  labels: observable.map({}),
  activeStatus: observable.map({
    left: '',
    right: '',
    bottom: ''
  })
})

state.views = {}

export default state
