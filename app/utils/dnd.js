import map from 'lodash/map'
import { observable, computed, action, autorun } from 'mobx'
import emitter from './emitter'

export const DND_DRAG_START = 'DND_DRAG_START'
export const DND_DRAG_OVER = 'DND_DRAG_OVER'
export const DND_UPDATE_DRAG_OVER_META = 'DND_UPDATE_DRAG_OVER_META'
export const DND_DRAG_END = 'DND_DRAG_END'
export const DND_UPDATE_DROPPABLES = 'DND_UPDATE_DROPPABLES'

function getDroppables () {
  const droppables = map(document.querySelectorAll('[data-droppable]'), DOMNode => ({
    id: DOMNode.id,
    DOMNode,
    type: DOMNode.getAttribute('data-droppable'),
    rect: DOMNode.getBoundingClientRect()
  }))
  return droppables
}

const dnd = observable({
  isDragging: false,
  source: { id: null, type: null },
  target: { id: null, type: null },
  droppables: observable.shallowArray([]),
  meta: null,
})

dnd.dragStart = source => emitter.emit(DND_DRAG_START, source)
dnd.dragOver = target => emitter.emit(DND_DRAG_OVER, target)
dnd.updateDragOverMeta = meta => emitter.emit(DND_UPDATE_DRAG_OVER_META, meta)
dnd.dragEnd = () => emitter.emit(DND_DRAG_END)
dnd.updateDroppables = () => emitter.emit(DND_UPDATE_DROPPABLES)

emitter.on(DND_DRAG_START, (source = {}) => {
  dnd.isDragging = true
  dnd.source = source
  dnd.droppables = observable.shallowArray(getDroppables())
})

emitter.on(DND_DRAG_OVER, (target = {}) => {
  if (!dnd.target || dnd.target.id !== target.id) dnd.target = target
})

emitter.on(DND_UPDATE_DRAG_OVER_META, (meta) => {
  dnd.meta = meta
})

emitter.on(DND_DRAG_END, () => {
  dnd.isDragging = false
  dnd.source = dnd.target = {}
})

emitter.on(DND_UPDATE_DROPPABLES, () => {
  dnd.droppables = observable.shallowArray(getDroppables())
})

export default dnd
