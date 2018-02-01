import { registerAction } from 'utils/actions'
import state from './state'

export const showMask = registerAction('mask:show_mask', ({ message = 'Working...' }) => {
  state.operating = true
  state.operatingMessage = message
})

export const hideMask = registerAction('mask:hide_mask', () => {
  state.operating = false
  state.operatingMessage = ''
})
