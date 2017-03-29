import { emitter } from 'utils'

let _context = null

export function setContext (context) { _context = context }

export default function dispatchCommand (commandType, data) {
  let command
  if (typeof commandType === 'object') command = commandType
  else if (typeof commandType === 'string') command = { type: commandType, data }
  else return
  // bind context to command before run
  command.context = _context
  emitter.emit(command.type, command)
}
