// http://stackoverflow.com/questions/7295508/javascript-capture-browser-shortcuts-ctrlt-n-w

'use strict';

var _keycodes = require('./keycodes');

var Keymapper;
var _keymaps = { global: {} };
var _wait = 300;
var _commandHandlers = {};
var _lastTimeoutId;
var _combinator = '+';
var _context = 'global';
var _commandBuffer = {
  keys: [],
  command: null,
  reset: function () {
    this.keys.length = 0;
    this.command = null;
  },
  setCommand: function (command) {
    this.command = command;
  }
};
var _modifiersList = ['cmd', 'ctrl', 'shift', 'alt'];
var _modifiers = {
  cmd: false,
  ctrl: false,
  shift: false,
  alt: false,
  reset: function () {
    this.cmd = this.ctrl = this.shift = this.alt = false;
  },
  toString: modifiersToString
};

function modifiersToString(e) {
  var _this = e || this;
  var modifiers = _modifiersList.reduce(function (ret, modifier) {
    var modKey = e ? modifier + 'Key' : modifier;
    if (modKey === 'cmdKey') modKey = 'metaKey';
    if (_this[modKey]) ret.push(modifier);
    return ret;
  }, []);
  return modifiers.join(_combinator);
}

function keyEventToKeyCombination(e) {
  var modString = modifiersToString(e);
  if (!modString) modString = _modifiers.toString();
  _modifiers.reset();
  if (modString) {
    return [modString, _keycodes.keyCodeToKey[e.keyCode]].join(_combinator);
  } else {
    return _keycodes.keyCodeToKey[e.keyCode];
  }
}

function handleKeyEvent(e) {
  clearTimeout(_lastTimeoutId);

  switch (e.key) {
    case 'Meta' || 'OS':
      _modifiers.cmd = true;
      break;
    case 'Control':
      _modifiers.ctrl = true;
      break;
    case 'Shift':
      _modifiers.shift = true;
      break;
    case 'Alt':
      _modifiers.alt = true;
      break;
    default:
      _commandBuffer.keys.push(keyEventToKeyCombination(e));
      _commandBuffer.setCommand({
        keyboardEvent: e,
        context: _context || 'global'
      });
  }

  if ( consumeCommandBuffer() )  {e.preventDefault();e.stopPropagation()};
  // _lastTimeoutId = setTimeout(function () {
  //   if ( consumeCommandBuffer() )  {e.preventDefault(); e.stopPropagation()};
  // }, _wait);
}

function consumeCommandBuffer() {
  var stopPropagation = false;
  if (_commandBuffer.keys.length) {
    _commandBuffer.command.keys = _commandBuffer.keys.join(',');
    _commandBuffer.command = normalizeCommand(_commandBuffer.command);
    stopPropagation = handleCommand(_commandBuffer.command);
  }
  _modifiers.reset();
  _commandBuffer.reset();
  return stopPropagation;
}

function normalizeCommand(command) {
  var keys = command.keys;
  var context = command.context;

  if (!keys) return command;

  if (!_keymaps[context]) context = 'global';
  command.$$context = context;
  command.type = _keymaps[context][keys];
  if (typeof command.type === 'function') {
    command.$$handler = command.type;
    command.type = null;
  }
  return command;
}

function handleCommand(command) {
  var handler = command.type ? _commandHandlers[command.type] : command.$$handler;
  if (!handler) return false;
  return !handler(command); // handler can explicitly return true to continue propagation.
}

function normalizeKeys(keys) {
  keys = keys.toLowerCase().replace(/\s/g, '');
  var keyCombos = keys.split(',');
  return keyCombos.map(function (keyCombo) {
    var pseudoKeyEvent = {};
    keyCombo.split(_combinator).forEach(function (key) {
      if (_modifiersList.indexOf(key) > -1) {
        if (key == 'cmd') key = 'meta';
        pseudoKeyEvent[key + 'Key'] = true;
      } else {
        pseudoKeyEvent.keyCode = _keycodes.keyToKeyCode[key];
      }
    });
    if (typeof pseudoKeyEvent.keyCode != 'number') {
      throw Error('Keymapper: Unrecognized key combination `' + keyCombo + '`');
    }
    return keyEventToKeyCombination(pseudoKeyEvent);
  }).join(',');
}


Keymapper = function () {

  function Keymapper(config) {
    config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var constructor = function (_this) {
      if (!_this) return new Keymapper(config);
      if (!Keymapper.$$singleton) {
        var combinator = config.combinator;
        var wait = config.wait;

        if (typeof combinator == 'string') {
          if (combinator != '+' && combinator != '-') {
            throw Error('Keymapper: ' + 'Unrecognized combinator, only "+" or "-" is supported.');
          }
          _combinator = combinator;
        }

        if (typeof wait == 'number') {_wait = wait;}

        _this.add = _this.map;

        window.addEventListener('keydown', handleKeyEvent);
        Object.defineProperty(Keymapper, '$$singleton', { value: _this });
        return _this;
      } else {
        return Keymapper.$$singleton;
      }
    }

    var proto = Keymapper.prototype;

    proto.setContext = Keymapper.setContext;

    proto.map = function map(keys, descriptor) {
      if (typeof descriptor === 'string') {
        var commandType = descriptor;
        descriptor = { command: commandType, context: 'global' };
      } else if (typeof descriptor === 'function') {
        var handler = descriptor;
        descriptor = { command: handler, context: 'global' };
      }
      if (!descriptor.command || !descriptor.context) return;
      keys = normalizeKeys(keys);
      if (!_keymaps[descriptor.context]) _keymaps[descriptor.context] = {};
      _keymaps[descriptor.context][keys] = descriptor.command;
    }

    proto.loadKeymaps = function loadKeymaps(keymaps) {
      if (typeof keymaps == 'string') {
        try {keymaps = JSON.parse(keymaps);}
        catch (e) {
          throw Error('Keymapper: Invalid keymaps description. Fail to parse JSON to object.');
        }
      }
      if (!keymaps || typeof keymaps != 'object') return;
      for (var keys in keymaps) {
        if (typeof keymaps[keys] == 'string' || typeof keymaps[keys] == 'function') {
          this.map(keys, keymaps[keys]);
        } else if (typeof keymaps[keys] == 'object') {
          var context = keys;
          for (var _keys in keymaps[context]) {
            this.map(_keys, { command: keymaps[context][_keys], context: context });
          }
        } else {
          throw Error('Keymapper: Invalid keymaps description.');
        }
      }
    }

    proto.addCommandHandler = function addCommandHandler(commandType, commandHandler) {
      _commandHandlers[commandType] = commandHandler;
    }

    proto.loadCommandHandlers = function loadCommandHandlers(commandHandlers, override) {
      _commandHandlers = override ? commandHandlers : Object.assign(_commandHandlers, commandHandlers);
    }

    return constructor(this);
  }


  // static propperties;

  Keymapper.setContext = function setContext(context) {
    _context = context;
  };

  Keymapper.dispatchCommand = function dispatchCommand(command, context, data) {
    var _command;
    if (typeof command === 'object') {
      _command = normalizeCommand(command);
    } else if (typeof command === 'string') {
      _command = normalizeCommand({type:command,context:context,data:data});
    } else { return }
    
    handleCommand(_command);
  };

  return Keymapper;
}();


module.exports = Keymapper;