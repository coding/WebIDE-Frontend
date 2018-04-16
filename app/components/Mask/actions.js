import { registerAction } from 'utils/actions'
import state from './state'

export const showMask = registerAction('mask:show_mask', ({ message = 'Working...', countdown = 0, type }) => {
  state.operating = true
  state.operatingMessage = message
  state.countdown = countdown
  state.type = type
  clearInterval(state.progressInterval)
  state.progress = 0
  state.progressInterval = setInterval(() => {
    if (state.progress < 90) {
      state.progress += (600 * 100 / 1000 / countdown)
    }
  }, 600)
})

export const hideMask = registerAction('mask:hide_mask', (time = 1000) => {
  clearInterval(state.progressInterval)
  state.progress = 100
  setTimeout(() => {
    state.operating = false
    state.operatingMessage = ''
  }, time)
})
