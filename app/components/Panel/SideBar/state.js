import { PropTypes } from 'react'
import _ from 'lodash'
import PaneScope from 'commons/Pane/state'
import { extendObservable, observable } from 'mobx'

const { state } = PaneScope()

/*
side bar api
* side bar state shape
  labels: { // map格式，observable
          //  sideBar label
          [viewId]:
            key, // 业务名 required
            viewId, // 视图名 optional defatult: {side_key_instanceId}
            text,   // 标签元素 optional
            icon, // 标签图标 optional
            instanceId, // component 的 实例名 optional
            onSidebarActive: func, // side bar 激活通知
            onSidebarDeactive: func, // side bar 隐藏通知
            weight: number // control the view order // 排序序号 optional
            isActive: bool // 是否默认开启
        },
  },
  activeStatus: { observable，普通object
    left: '', // 不同 side 当前激活情况
  },
  hiddenStatus: []
  views: { // component cache，根据 viewid 去查
      [viewId]: {view} component
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
  }),
  hiddenStatus: observable([])
})

state.views = {}

export default state
