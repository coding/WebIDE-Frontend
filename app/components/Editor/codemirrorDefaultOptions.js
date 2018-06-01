const os = (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()
export const isMac = (os === 'mac')
const mod = isMac ? 'Cmd' : 'Ctrl'
// const keyComment = `${mod}-/`

const extraKeys = {}

extraKeys['Tab'] = function betterTab (cm) {
  if (cm.somethingSelected()) {
    cm.indentSelection('add')
  } else {
    cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t' :
      Array(cm.getOption('indentUnit') + 1).join(' '), 'end', '+input'
    )
  }
}

// extraKeys[keyComment] = function commentSelection (cm) {
//   const range = { from: cm.getCursor(true), to: cm.getCursor(false) }
//   // cm.toggleComment(range.from, range.to, { indent: true })
//   if (range.from.line === range.to.line) {
//     if (!cm.uncomment(range.from, range.to)) {
//       cm.lineComment(range.from, range.to, { indent: true })
//     }
//   } else {
//     if (!cm.uncomment(range.from, range.to)) {
//       cm.blockComment(range.from, range.to, { fullLines: false })
//     }
//   }
// }

// extraKeys['Alt-L'] = function formatCode (cm) {
//   let range = { from: cm.getCursor(true), to: cm.getCursor(false) }
//   if (range.from.ch === range.to.ch && range.from.line === range.to.line) {
//     cm.execCommand('selectAll')
//     range = { from: cm.getCursor(true), to: cm.getCursor(false) }
//   }
//   cm.autoFormatRange(range.from, range.to)
// }

// precisely, these are the default options that we want to override
const options = {
  theme: 'default',
  autofocus: false,
  lineNumbers: true,
  lint: null,
  matchBrackets: true,
  autoCloseBrackets: true,
  dragDrop: false,
  trimTrailingWhitespace: undefined,
  insertFinalNewline: undefined,
  smartIndent: false,
  extraKeys,
}

export default options
