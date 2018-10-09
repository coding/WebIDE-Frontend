import * as modalActions from 'components/modal/actions'

export function modalRegister (name, component, command) {
  modalActions.modalRegister(name, component, command)
}

export function showModal (modalConfig) {
  modalActions.showModal(modalConfig)
}
