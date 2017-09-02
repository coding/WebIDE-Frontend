import EventEmitter from 'eventemitter3'

export default new EventEmitter()

export const PANEL_RESIZED = 'PANEL_RESIZED'
export const THEME_CHANGED = 'THEME_CHANGED'
export const SOCKET_TRIED_FAILED = 'SOCKET_TRIED_FAILED'
export const SOCKET_RETRY = 'SOCKET_RETRY'
export const FILE_CHANGE = 'FILE_CHANGE'
