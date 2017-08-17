import EventEmitter from 'eventemitter3'

const emitter = new EventEmitter()
export default emitter

export const PANEL_RESIZED = 'PANEL_RESIZED'
export const THEME_CHANGED = 'THEME_CHANGED'
export const SOCKET_TRIED_FAILED = 'SOCKET_TRIED_FAILED'
export const SOCKET_RETRY = 'SOCKET_RETRY'
