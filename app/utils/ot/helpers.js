import TextOperation, { isRetain, isInsert, isDelete } from './TextOperation'

export function adaptServerOperationData ({ clientId, path, resultingVersion, ops }) {
  const textOps = ops.map((op) => {
    switch (op.type) {
      case 'RETAIN':
        return Number(op.content)
      case 'CHARACTERS':
        return op.content
      case 'DELETE_CHARACTERS':
        return op.content.length * -1
    }
  })

  return {
    clientId,
    path,
    revision: resultingVersion,
    textOperation: TextOperation.fromJSON(textOps),
  }
}

export function adaptClientOperationData ({
  clientId,
  author,
  filePath,
  targetVersion,
  textOperation
}) {
  const ops = textOperation.ops.map((op) => {
    if (isRetain(op)) {
      return {
        type: 'RETAIN',
        content: String(op),
      }
    } else if (isInsert(op)) {
      return {
        type: 'CHARACTERS',
        content: op,
      }
    } else if (isDelete(op)) {
      let nonsenseString = ''
      while (op < 0) {
        nonsenseString += '_'
        op++
      }
      return {
        type: 'DELETE_CHARACTERS',
        content: nonsenseString,
      }
    }

    // throw Error('Invalid data receive at adaptClientOperationData', op)
  })

  return {
    path: filePath,
    author,
    clientId,
    targetVersion,
    ops,
  }
}


function rgb2hex (r, g, b) {
  function digits (n) {
    var m = Math.round(255*n).toString(16);
    return m.length === 1 ? '0'+m : m;
  }
  return '#' + digits(r) + digits(g) + digits(b);
}

export function hsl2hex (h, s, l) {
  if (s === 0) { return rgb2hex(l, l, l); }
  var var2 = l < 0.5 ? l * (1+s) : (l+s) - (s*l);
  var var1 = 2 * l - var2;
  var hue2rgb = function (hue) {
    if (hue < 0) { hue += 1; }
    if (hue > 1) { hue -= 1; }
    if (6*hue < 1) { return var1 + (var2-var1)*6*hue; }
    if (2*hue < 1) { return var2; }
    if (3*hue < 2) { return var1 + (var2-var1)*6*(2/3 - hue); }
    return var1;
  };
  return rgb2hex(hue2rgb(h+1/3), hue2rgb(h), hue2rgb(h-1/3));
}

export function hueFromName (name) {
  var a = 1;
  for (var i = 0; i < name.length; i++) {
    a = 17 * (a+name.charCodeAt(i)) % 360;
  }
  return a/360;
}
