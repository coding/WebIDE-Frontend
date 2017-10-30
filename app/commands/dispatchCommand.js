import { emitter } from 'utils'
import { isArray } from 'utils/is'

let _context = null

export function setContext (context) { _context = context }


export function addCommand (obj) {
  if (isArray(obj)) {
    obj.forEach((element) => {
      addCommand(element)
    })
  } else {
    const key = Object.keys(obj)[0]
    emitter.on(key, obj[key])
  }
}

function dispatchCommand (commandType, data) {
  let command
  if (typeof commandType === 'object') command = commandType
  else if (typeof commandType === 'string') command = { type: commandType, data }
  else return
  // bind context to command before run
  command.context = _context
  emitter.emit(command.type, command)
}

window.dispatchCommand = dispatchCommand

export default dispatchCommand
