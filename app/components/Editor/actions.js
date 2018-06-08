import { registerAction } from 'utils/actions'
import mobxStore from '../../mobxStore'

const getCurrentCM = () => {
  const { EditorTabState } = mobxStore
  const activeTab = EditorTabState.activeTab
  const cm = activeTab ? activeTab.editor.cm : null
  return cm
}

const getCurrentMonaco = () => {
  const { EditorTabState } = mobxStore
  const activeTab = EditorTabState.activeTab
  const monaco = activeTab ? activeTab.editorInfo.monacoEditor : null
  return monaco
}


export const formatMonacoCode = registerAction('edit:toggle_format_monaco', () => {
  const monaco = getCurrentMonaco()
  monaco.trigger('format', 'editor.action.formatDocument')
  // debugger
  // if (!monaco) return
  // const action = monaco.getAction('editor.action.format')
  // if (action) {
  //   action.run()
  // }
  // let range = { from: cm.getCursor(true), to: cm.getCursor(false) }
  // if (range.from.ch === range.to.ch && range.from.line === range.to.line) {
  //   cm.execCommand('selectAll')
  //   range = { from: cm.getCursor(true), to: cm.getCursor(false) }
  // }
  // cm.autoFormatRange(range.from, range.to)
})


export const formatCode = registerAction('edit:toggle_format', () => {
  const cm = getCurrentCM()
  if (!cm) return
  let range = { from: cm.getCursor(true), to: cm.getCursor(false) }
  if (range.from.ch === range.to.ch && range.from.line === range.to.line) {
    cm.execCommand('selectAll')
    range = { from: cm.getCursor(true), to: cm.getCursor(false) }
  }
  cm.autoFormatRange(range.from, range.to)
})

export const toggleComment = registerAction('edit:toggle_comment', () => {
  const cm = getCurrentCM()
  if (!cm) return
  const range = { from: cm.getCursor(true), to: cm.getCursor(false) }
  // cm.toggleComment(range.from, range.to, { indent: true })
  if (range.from.line === range.to.line) {
    if (!cm.uncomment(range.from, range.to)) {
      cm.lineComment(range.from, range.to, { indent: true })
    }
  } else if (!cm.uncomment(range.from, range.to)) {
    cm.blockComment(range.from, range.to, { fullLines: false })
  }
})
