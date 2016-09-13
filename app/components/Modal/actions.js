export const MODAL_SHOW = 'MODAL_SHOW';
export function showModal({modalType, content}) {
  return {
    type: MODAL_SHOW,
    modalType,
    content
  }
}

export const MODAL_DISMISS = 'MODAL_DISMISS';
export function dismissModal() {
  return {
    type: MODAL_DISMISS
  }
}
