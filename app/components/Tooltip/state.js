import { observable } from 'mobx'

const state = observable({
  entities: []
})

export function addTooltip (tooltip, delay=500) {
  tooltip.show = false
  state.entities.push(tooltip)
  tooltip = state.entities[state.entities.length - 1]
  tooltip.timeoutId = window.setTimeout(() => tooltip.show = true, delay)
  return tooltip
}

export function removeTooltip (tooltip, delay=500) {
  window.clearTimeout(tooltip.timeoutId)
  tooltip.show = false
  window.setTimeout(() => state.entities.remove(tooltip), delay)
}

export default state
