import EventEmitter from 'eventemitter3'

export default new EventEmitter()

export const PANEL_RESIZED = 'PANEL_RESIZED'
export const PANEL_SHOW = 'PANEL_SHOW'
export const PANEL_HIDE = 'PANEL_HIDE'
export const THEME_CHANGED = 'THEME_CHANGED'
export const SOCKET_TRIED_FAILED = 'SOCKET_TRIED_FAILED'
export const SOCKET_RETRY = 'SOCKET_RETRY'
export const FILE_CHANGE = 'FILE_CHANGE'
export const FILE_HIGHLIGHT = 'FILE_HIGHLIGHT'
export const TERM_ENV_HIDE = 'TERM_ENV_HIDE'
export const TERM_ENV_SHOW = 'TERM_ENV_SHOW'
export const TERM_THEME_CHANGE = 'TERM_THEME_CHANGE'
export const TERM_FONTSIZE_CHANGE = 'TERM_FONTSIZE_CHANGE'
