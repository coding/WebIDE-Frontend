/* @flow weak */
import ace from 'brace'
import 'brace/ext/modelist'
var aceModes = ace.acequire('ace/ext/modelist')

export default function getMode (path) {
  var modePath = aceModes.getModeForPath(path).mode
  var mode = modePath.split('/').pop()
  return mode
}
