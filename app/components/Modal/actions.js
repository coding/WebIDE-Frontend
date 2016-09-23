/* @flow weak */
const createAction = (action) => {
  var resolve, reject
  var promise = new Promise((rs, rj)=>{resolve = rs; reject = rj})
  var baseAction = {
    meta: { promise, resolve, reject },
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise)
  }

  return Object.assign(baseAction, action)
}


export const MODAL_SHOW = 'MODAL_SHOW';
export function showModal(modalType, content) {
  return createAction({
    type: MODAL_SHOW,
    payload: {modalType, content}
  })

}


export const MODAL_DISMISS = 'MODAL_DISMISS';
export function dismissModal() {
  return {
    type: MODAL_DISMISS
  }
}


export const MODAL_UPDATE = 'MODAL_UPDATE';
export function updateModal(content) {
  return createAction({
    type: MODAL_UPDATE,
    payload: {content}
  })
}
