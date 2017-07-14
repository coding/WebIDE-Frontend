import TextOperation from './TextOperation'
import Selection from './Selection'
import last from 'lodash/last'
import { chroma } from 'utils/colors'
import cx from 'classnames'

// helpers:
const addStyleRule = (function () {
  var added = {};
  var styleElement = document.createElement('style');
  document.documentElement.getElementsByTagName('head')[0].appendChild(styleElement);
  var styleSheet = styleElement.sheet

  return function (css) {
    if (added[css]) { return; }
    added[css] = true;
    // styleSheet.insertRule(css, (styleSheet.cssRules || styleSheet.rules).length);
    styleElement.innerText = css
  };
}())

function cmpPos (a, b) {
  if (a.line < b.line) { return -1; }
  if (a.line > b.line) { return 1; }
  if (a.ch < b.ch)     { return -1; }
  if (a.ch > b.ch)     { return 1; }
  return 0;
}
function posEq (a, b) { return cmpPos(a, b) === 0; }
function posLe (a, b) { return cmpPos(a, b) <= 0; }

function minPos (a, b) { return posLe(a, b) ? a : b; }
function maxPos (a, b) { return posLe(a, b) ? b : a; }

function codemirrorDocLength (doc) {
  return doc.indexFromPos({ line: doc.lastLine(), ch: 0 }) +
    doc.getLine(doc.lastLine()).length
}


class CodeMirrorAdapter {
  // convert CodeMirror (v4) change list into a TextOperation and its inverse
  // then returns [textOperation, inverseOf(textOperation)]
  //
  // Approach:
  // Replay the changes, beginning with the most recent one, to construct the
  // operation and its inverse. We have to convert the position in the pre-change
  // coordinates to and index (cus OT relies on index, not :ln:col).
  //
  // We have CodeMirror's `indexFromPos` method to covert a pos to an index
  // after all changes to an index. But that's a post-change index, and we need
  // pre-change index. We can use the information of a single change object
  // to convert a post-change coordinate system to a pre-change one. Thus we can
  // proceed inductively to get a pre-change coordinate system for all the changes.
  //
  // A disadvantage of this approach is its complexity `O(n^2)` in the length of change list.
  static operationFromCodeMirrorChanges (changes, doc) {
    function sumLengths (strArr) {
      if (strArr.length === 0) { return 0; }
      let sum = 0;
      for (let i = 0; i < strArr.length; i++) { sum += strArr[i].length; }
      return sum + strArr.length - 1;
    }

    // @note
    // gee...this is some real detail shit, gonna read it later
    // the indexFromPos function will be written and wrapped recursively:
    let indexFromPos = function (pos) { return doc.indexFromPos(pos) }
    function updateIndexFromPos (indexFromPos, change) {
      return function (pos) {
        if (posLe(pos, change.from)) { return indexFromPos(pos); }
        if (posLe(change.to, pos)) {
          return indexFromPos({
            line: pos.line + change.text.length - 1 - (change.to.line - change.from.line),
            ch: (change.to.line < pos.line) ?
              pos.ch :
              (change.text.length <= 1) ?
                pos.ch - (change.to.ch - change.from.ch) + sumLengths(change.text) :
                pos.ch - change.to.ch + last(change.text).length
          }) + sumLengths(change.removed) - sumLengths(change.text);
        }
        if (change.from.line === pos.line) {
          return indexFromPos(change.from) + pos.ch - change.from.ch;
        }
        return indexFromPos(change.from) + sumLengths(change.removed.slice(0, pos.line - change.from.line)) + 1 + pos.ch
      }
    }

    let docEndLength = codemirrorDocLength(doc)
    let operation = new TextOperation().retain(docEndLength)
    let inverse = new TextOperation().retain(docEndLength)

    for (let i = changes.length - 1; i >= 0; i--) {
      const change = changes[i]
      indexFromPos = updateIndexFromPos(indexFromPos, change)

      const fromIndex = indexFromPos(change.from)
      const restLength = docEndLength - fromIndex - sumLengths(change.text)

      operation = new TextOperation()
        .retain(fromIndex)
        ['delete'](sumLengths(change.removed))
        .insert(change.text.join('\n'))
        .retain(restLength)
        .compose(operation)

      inverse = inverse.compose(new TextOperation()
        .retain(fromIndex)
        ['delete'](sumLengths(change.text))
        .insert(change.removed.join('\n'))
        .retain(restLength)
      )

      docEndLength += sumLengths(change.removed) - sumLengths(change.text)
    }

    return [operation, inverse]
  }

  static applyOperationToCodeMirror (operation, cm) {
    cm.operation(() => {
      const ops = operation.ops
      let index = 0  // holds the current index into CodeMirror's content
      for (let i = 0, l = ops.length; i < l; i++) {
        let op = ops[i]
        if (TextOperation.isRetain(op)) {
          index += op // here op is just the retain number
        } else if (TextOperation.isInsert(op)) {
          cm.replaceRange(op, cm.posFromIndex(index))
          index += op.length
        } else if (TextOperation.isDelete(op)) {
          const from = cm.posFromIndex(index)
          const to = cm.posFromIndex(index - op)
          cm.replaceRange('', from, to)
        }
      }
    })
  }


  constructor (cm) {
    this.ignoreNextChange = false
    this.changeInProgress = false
    this.selectionChanged = false
    this.cm = cm

    cm.on('change', this.onChange)
    cm.on('changes', this.onChanges)
    cm.on('cursorActivity', this.onCursorActivity)
    cm.on('focus', this.onFocus)
    cm.on('blur', this.onBlur)
  }

  // By default, CodeMirror's event order is the following:
  // 1. 'change', 2. 'cursorActivity', 3. 'changes'.
  // We want to fire the 'selectionChange' event after the 'change' event,
  // but need the information from the 'changes' event. Therefore, we detect
  // when a change is in progress by listening to the change event, setting
  // a flag that makes this adapter defer all 'cursorActivity' events.
  onChange = () => { this.changeInProgress = true }

  onChanges = (_, changes) => {
    if (!this.ignoreNextChange) {
      const pair = CodeMirrorAdapter.operationFromCodeMirrorChanges(changes, this.cm)
      this.trigger('change', pair[0], pair[1])
    }
    if (this.selectionChanged) { this.trigger('selectionChange') }
    this.changeInProgress = false
    this.ignoreNextChange = false
  }

  onFocus = () => {
    if (this.changeInProgress) {
      this.selectionChanged = true
    } else {
      this.trigger('selectionChange')
    }
  }

  onCursorActivity = this.onFocus

  onBlur = () => {
    if (!this.cm.somethingSelected()) this.trigger('blur')
  }

  detach () {
    this.cm.off('changes', this.onChanges)
    this.cm.off('change', this.onChange)
    this.cm.off('cursorActivity', this.onCursorActivity)
    this.cm.off('focus', this.onFocus)
    this.cm.off('blur', this.onBlur)
  }

  registerCallbacks (cb) {
    this.callbacks = cb
  }

  getValue () {
    return this.cm.getValue()
  }

  getSelection () {
    const cm = this.cm

    // @note
    // multiple selections
    // need to checkout Selection class
    const selectionList = cm.listSelections()
    const ranges = []
    for (var i = 0; i < selectionList.length; i++) {
      ranges[i] = new Selection.Range(
        cm.indexFromPos(selectionList[i].anchor),
        cm.indexFromPos(selectionList[i].head)
      )
    }

    return new Selection(ranges)
  }

  setSelection (selection) {
    const ranges = []
    for (var i = 0; i < selection.ranges.length; i++) {
      const range = selection.ranges[i]
      ranges[i] = {
        anchor: this.cm.posFromIndex(range.anchor),
        head:   this.cm.posFromIndex(range.head)
      }
    }
    this.cm.setSelections(ranges)
  }

  // @note
  // the following 3 methods are for marking collaboration's contributions
  // using `cm.setBookmark()` and `cm.markText()`

  // 1. set collaborator's cursor
  setOtherCursor (position, hue, clientId) {
    const [r, g, b] = chroma.hsv2rgb(hue, 1, 0.8)
    const cursorPos = this.cm.posFromIndex(position)

    const cursorWrapper = document.createElement('span')
    const cursorEl = document.createElement('span')
    const cursorTag = document.createElement('div')
    cursorTag.innerText = clientId
    cursorWrapper.appendChild(cursorEl)
    cursorWrapper.appendChild(cursorTag)

    cursorWrapper.style.position = 'relative'
    Object.assign(cursorEl.style, {
      position: 'absolute',
      top: '-5px',
      bottom: '0px',
      right: '1px',
      width: '2px',
      backgroundColor: `rgb(${r},${g},${b})`,
    })
    Object.assign(cursorTag.style, {
      position: 'absolute',
      fontSize: '1em',
      top: '-1.2em',
      left: '-5px',
      padding: '2px 5px',
      color: 'white',
      backgroundColor: `rgba(${r},${g},${b},1)`,
    })

    return this.cm.setBookmark(cursorPos, { widget: cursorWrapper, insertLeft: true })
  }

  // 2. set collaborator's range
  setOtherSelectionRange (range, hue, clientId) {
    const [r0, g0, b0] = chroma.hsv2rgb(hue, 0.4, 1)
    const color = `rgb(${r0},${g0},${b0})`
    const [r, g, b] = chroma.hsv2rgb(hue, 1, 0.8)
    const selectionClassName = 'selection-' + hue
    // const rule = '.' + selectionClassName + ' { background: ' + color + '; }'
    const anchorPos = this.cm.posFromIndex(range.anchor)
    const headPos = this.cm.posFromIndex(range.head)

    addStyleRule(
`.${selectionClassName} {
  background-color: ${color};
}

.${selectionClassName}.selection-last-span {
  position: relative;
}

.${selectionClassName}.selection-last-span::before {
  position: absolute;
  top: -5px;
  bottom: 0px;
  right: 1px;
  width: 2px;
  content: '';
  background-color: rgb(${r},${g},${b});
}

.${selectionClassName}.selection-last-span::after {
  position: absolute;
  font-size: 1em;
  top: -1.2em;
  left: 100%;
  margin-left: -5px;
  padding: 2px 5px;
  color: white;
  content: "${clientId}";
  background-color: rgba(${r},${g},${b},1);
}

.${selectionClassName}.selection-first-line.selection-last-span::after {
  top: initial;
  bottom: -1.2em;
}
`)

    const className = cx(selectionClassName, { 'selection-first-line': headPos.line === 0 })
    return this.cm.markText(
      minPos(anchorPos, headPos),
      maxPos(anchorPos, headPos),
      { className, endStyle: 'selection-last-span' }
    )
  }

  // 3. proxy to aforementioned two fellows
  setOtherSelection (selection, hue, clientId) {
    const selectionObjects = []
    console.log('[setOtherSelection range length]', selection.ranges[0])
    for (let i = 0; i < selection.ranges.length; i++) {
      const range = selection.ranges[i]
      if (range.isEmpty()) {
        selectionObjects[i] = this.setOtherCursor(range.head, hue, clientId)
      } else {
        selectionObjects[i] = this.setOtherSelectionRange(range, hue, clientId)
      }
    }

    return {
      clear () {
        for (let i = 0; i < selectionObjects.length; i++) {
          selectionObjects[i].clear()
        }
      }
    }
  }

  trigger (event, ...args) {
    const action = this.callbacks && this.callbacks[event]
    if (action) action.apply(this, args)
  }

  // @invoked by EditorClient
  applyOperation (operation) {
    this.ignoreNextChange = true
    this.constructor.applyOperationToCodeMirror(operation, this.cm)
  }

  registerUndo (undoFn) {
    this.cm.undo = undoFn
  }

  registerRedo (redoFn) {
    this.cm.redo = redoFn
  }
}

export default CodeMirrorAdapter
