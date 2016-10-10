/* @flow weak */
// http://stackoverflow.com/questions/7295508/javascript-capture-browser-shortcuts-ctrlt-n-w

'use strict'

var _keycodes = require('./keycodes')

var Keymapper
var _keysRegistered = {}
var _keymaps = { global: {} }
var _commandHandlers = {}
var _combinator = '+'
var _scope = 'global'
var _context = null
var _commandBuffer = {
  keys: [],
  command: null,
  reset: function () {
    this.keys.length = 0
    this.command = null
  },
  setCommand: function (command) {
    this.command = command
  }
}

var MODIFIERS_LIST = ['cmd', 'ctrl', 'shift', 'alt']
function modifiersToString (e) {
  // returned comb always in the order spec by MODIFIERS_LIST
  var modifiers = MODIFIERS_LIST.reduce(function (ret, modifier) {
    var modKey = modifier + 'Key'
    if (modKey === 'cmdKey') modKey = 'metaKey' // internally we call it `cmd` but e use `metaKey`
    if (e[modKey]) ret.push(modifier)
    return ret
  }, [])
  return modifiers.join(_combinator)
}

function keyEventToKeyCombination (e) {
  var modString = modifiersToString(e)
  if (modString) {
    return [modString, _keycodes.keyCodeToKey[e.keyCode]].join(_combinator)
  } else {
    return _keycodes.keyCodeToKey[e.keyCode]
  }
}

var _wait = 500
var _lastTimeoutId
function handleKeyEvent (e) {
  var isComboPending = Boolean(_lastTimeoutId)

  if (window.logKeyEvent) console.log(e) // debug

  // only modifier pressed, ignore
  if (['Meta', 'OS', 'Control', 'Shift', 'Alt'].indexOf(e.key) > -1) return

  var keyCombination = keyEventToKeyCombination(e)
  var keyCombinationState = _keysRegistered[keyCombination]

  if (keyCombinationState === undefined && !isComboPending) return

  _commandBuffer.keys.push(keyCombination)
  _commandBuffer.setCommand({
    keyboardEvent: e,
    scope: _scope || 'global'
  })

  clearTimeout(_lastTimeoutId)
  _lastTimeoutId = undefined

  if (keyCombinationState == 1) {
    if (consumeCommandBuffer()) { e.preventDefault(); e.stopPropagation() };
    return
  }

  if (keyCombinationState > 1 || isComboPending) {
    e.preventDefault(); e.stopPropagation()
    _lastTimeoutId = setTimeout(consumeCommandBuffer, _wait)
  }
}

function consumeCommandBuffer () {
  _lastTimeoutId = undefined
  var shouldStopPropagation = false
  if (_commandBuffer.keys.length) {
    _commandBuffer.command.keys = _commandBuffer.keys.join(',')
    _commandBuffer.command = normalizeCommand(_commandBuffer.command)
    shouldStopPropagation = handleCommand(_commandBuffer.command)
  }
  _commandBuffer.reset()
  return shouldStopPropagation
}

function normalizeCommand (command) {
  var keys = command.keys
  var scope = command.scope

  if (!keys) return command

  if (!_keymaps[scope]) scope = 'global'
  command.$$scope = scope
  command.type = _keymaps[scope][keys]
  if (typeof command.type === 'function') {
    command.$$handler = command.type
    command.type = null
  }
  return command
}

function handleCommand (command) {
  if (window.logKeyEvent) console.log(command) // debug
  var handler = command.type ? _commandHandlers[command.type] : command.$$handler
  if (!handler) return false
  command.context = _context  // bind context to command before run, there's no way to change it at this point.
  return !handler(command) // handler can explicitly return true to continue propagation.
}

function normalizeKeys (keys) {
  // validate keys spec, if valid, also unify order of modifiers as in MODIFIERS_LIST
  keys = keys.toLowerCase().replace(/\s/g, '')
  var keyCombos = keys.split(',')
  return keyCombos.map(function (keyCombo) {
    var pseudoKeyEvent = {}
    keyCombo.split(_combinator).forEach(function (key) {
      if (MODIFIERS_LIST.indexOf(key) > -1) {
        if (key == 'cmd') key = 'meta'
        pseudoKeyEvent[key + 'Key'] = true
      } else {
        pseudoKeyEvent.keyCode = _keycodes.keyToKeyCode[key]
      }
    })
    if (typeof pseudoKeyEvent.keyCode != 'number') {
      throw Error('Keymapper: Unrecognized key combination `' + keyCombo + '`')
    }
    return keyEventToKeyCombination(pseudoKeyEvent)
  }).join(',')
}

function registerKeys (keys) {
  var keysArr = keys.split(',')
  _keysRegistered[keysArr[0]] = keysArr.length
}

function unregisterKeys (keys) {
  var keysArr = keys.split(',')
  delete _keysRegistered[keysArr[0]]
}

function registerKeymaps (keys, descriptor) {
  if (!_keymaps[descriptor.scope]) _keymaps[descriptor.scope] = {}
  _keymaps[descriptor.scope][keys] = descriptor.command
}

Keymapper = function () {
  function Keymapper (config) {
    config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0]

    var constructor = function (_this) {
      if (!_this) return new Keymapper(config)
      if (!Keymapper.$$singleton) {
        var combinator = config.combinator
        var wait = config.wait

        if (typeof combinator == 'string') {
          if (combinator != '+' && combinator != '-') {
            throw Error('Keymapper: ' + 'Unrecognized combinator, only "+" or "-" is supported.')
          }
          _combinator = combinator
        }

        if (typeof wait == 'number') { _wait = wait }

        _this.add = _this.map

        window.addEventListener('keydown', handleKeyEvent)
        Object.defineProperty(Keymapper, '$$singleton', { value: _this })
        return _this
      } else {
        return Keymapper.$$singleton
      }
    }

    var proto = Keymapper.prototype

    proto.setScope = Keymapper.setScope

    proto.map = function map (keys, descriptor) {
      if (typeof descriptor === 'string') {
        var commandType = descriptor
        descriptor = { command: commandType, scope: 'global' }
      } else if (typeof descriptor === 'function') {
        var handler = descriptor
        descriptor = { command: handler, scope: 'global' }
      }
      if (!descriptor.command || !descriptor.scope) return
      keys = normalizeKeys(keys)
      registerKeys(keys)
      registerKeymaps(keys, descriptor)
    }

    proto.loadKeymaps = function loadKeymaps (keymaps) {
      if (typeof keymaps == 'string') {
        try { keymaps = JSON.parse(keymaps) }
        catch (e) {
          throw Error('Keymapper: Invalid keymaps description. Fail to parse JSON to object.')
        }
      }
      if (!keymaps || typeof keymaps != 'object') return
      for (var keys in keymaps) {
        if (typeof keymaps[keys] == 'string' || typeof keymaps[keys] == 'function') {
          this.map(keys, keymaps[keys])
        } else if (typeof keymaps[keys] == 'object') {
          var scope = keys
          for (var _keys in keymaps[scope]) {
            this.map(_keys, { command: keymaps[scope][_keys], scope: scope })
          }
        } else {
          throw Error('Keymapper: Invalid keymaps description.')
        }
      }
    }

    proto.addCommandHandler = function addCommandHandler (commandType, commandHandler) {
      _commandHandlers[commandType] = commandHandler
    }

    proto.loadCommandHandlers = function loadCommandHandlers (commandHandlers, override) {
      _commandHandlers = override ? commandHandlers : Object.assign(_commandHandlers, commandHandlers)
    }

    return constructor(this)
  }

  // static properties;
  Keymapper.setScope = function setScope (scope) {
    _scope = scope
  }

  Keymapper.setContext = function setContext (context) {
    _context = context
  }

  Keymapper.dispatchCommand = function dispatchCommand (command, scope, data) {
    var _command
    if (typeof command === 'object') {
      _command = normalizeCommand(command)
    } else if (typeof command === 'string') {
      _command = normalizeCommand({type: command, scope: scope, data: data})
    } else { return }

    handleCommand(_command)
  }

  return Keymapper
}()

module.exports = Keymapper
