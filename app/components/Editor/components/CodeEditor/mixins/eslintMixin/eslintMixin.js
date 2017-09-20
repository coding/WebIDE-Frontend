import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/lint.css'
import { extendObservable } from 'mobx'
import linterFactory from './codemirror-eslint'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'

function handleLinterError (error, cm) {
  cm.setOption('lint', {
    error,
    retry () {
      cm.setOption('lint', lintOption)
    }
  })
}

const lintOption = {
  async: true,
  getAnnotations: linterFactory(handleLinterError)
}

export default {
  key: 'eslint',
  shouldMount () {
    const editor = this.editor
    if (editor.modeInfo && editor.modeInfo.mode === 'javascript') return true
  },
  componentDidMount () {
    const editor = this.editor
    extendObservable(editor, {
      linter: { mode: 'javascript', name: 'ESLint' }
    })
    const cm = this.cm
    cm.setOption('gutters', ['CodeMirror-lint-markers'])
    cm.setOption('lint', lintOption)
  }
}
