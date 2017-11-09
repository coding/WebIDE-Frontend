import { observable } from 'mobx'

const state = observable({
  leftGrow: 50,
  rightGrow: 50,
  showBigSize: false,
  showPreview: false,
  previewUniqueId: '1',
  isResizing: false,
})

export default state
