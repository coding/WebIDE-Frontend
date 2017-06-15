import emitterDispatch from './dispatch'
export default function emitterMiddleware ({ dispatch, getState }) {
  return next => (action) => {
    emitterDispatch(action)
    return next(action)
  }
}
