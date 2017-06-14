/* @flow weak */
export default function setSelectionRange (input, start, end) {
  if (input.setSelectionRange) {
    input.focus()
    input.setSelectionRange(start, end)
  } else if (typeof input.selectionStart !== 'undefined') {
    input.selectionStart = start
    input.selectionEnd = end
    input.focus()
  } else if (input.createTextRange) {
    const selRange = input.createTextRange()
    selRange.collapse(true)
    selRange.moveStart('character', start)
    selRange.moveEnd('character', end)
    selRange.select()
    input.focus()
  }
}

