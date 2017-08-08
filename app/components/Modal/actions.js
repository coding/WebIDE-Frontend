import { registerAction } from 'utils/actions'
import state, { Modal } from './state'

const modalPayloadCreator = (modalConfig, content) => {
  switch (typeof modalConfig) {
    case 'object':
      return { ...modalConfig, id: _.uniqueId() }
    case 'string':
      return { type: modalConfig, id: _.uniqueId(), content }
    default:
      return { type: '' }
  }
}

export const MODAL_SHOW = 'MODAL_SHOW'
export const showModal = registerAction(MODAL_SHOW, modalPayloadCreator,
  (modalConfig) => {
    const modal = new Modal({ ...modalConfig, isActive: true })
    state.stack.replace([modal])
    return modal.meta.promise
  }
)


export const MODAL_ADD = 'MODAL_ADD'
export const addModal = registerAction(MODAL_ADD, modalPayloadCreator,
  (modalConfig) => {
    const modal = new Modal({ ...modalConfig, isActive: true })
    state.stack.push(modal)
    return modal.meta.promise
  }
)

export const MODAL_DISMISS = 'MODAL_DISMISS'
export const dismissModal = registerAction(MODAL_DISMISS, () => {
  state.stack.pop()
})

export const MODAL_UPDATE = 'MODAL_UPDATE'
export const updateModal = registerAction(MODAL_UPDATE,
  (content) => {
    const lastModal = state.stack[state.stack.length - 1]
    lastModal.update(content)
    return lastModal.meta.promise
  }
)
