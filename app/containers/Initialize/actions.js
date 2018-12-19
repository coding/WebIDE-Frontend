import initializeState from './state'

export function updateInfomationState (message) {
  initializeState.stepMessage = message
}

export function updateWarningInfo (err) {
  initializeState.warningMessage = err
}

export function updateRequestInfo (info) {
  initializeState.requestMessage = info
}
