import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/lint.css'
import { extendObservable } from 'mobx'
import linterFactory from './codemirror-eslint'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'

function handleLinterError (error, cm) {
  cm.setOption('lint', {
    name: 'ESLint',
    enabled: false,
    error,
    retry () {
      cm.setOption('lint', lintOption)
    }
  })
}

const lintOption = {
  name: 'ESLint',
  enabled: true,
  async: true,
  getAnnotations: linterFactory(handleLinterError),
  toggle (cm) {
    this.enabled = !this.enabled
    cm && cm.performLint()
  },
}

export default {
  key: 'eslint',
  shouldMount () {
    const editor = this.editor
    if (editor.modeInfo && (editor.modeInfo.mode === 'javascript' || editor.modeInfo.mode === 'jsx')) return true
  },
  componentDidMount () {
    const cm = this.cm
    cm.setOption('gutters', ['CodeMirror-lint-markers'])
    cm.setOption('lint', lintOption)
  }
}
