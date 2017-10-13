import debounce from 'lodash/debounce'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import dispatchCommand from 'commands/dispatchCommand'

const debounced = debounce(func => func(), 1000)

// handle .editorconfig "trim_trailing_whitespace" && "insert_final_newline"
function changeInterceptor (editor) {
  const fileContent = editor.cm.getValue()
  let modFileContent = fileContent

  const { trimTrailingWhitespace, insertFinalNewline } = editor.options
  if (trimTrailingWhitespace) {
    modFileContent = modFileContent.replace(/[ \t]+$/gm, '')
  }

  if (insertFinalNewline) {
    if (!modFileContent.endsWith('\n')) modFileContent += '\n'
  }

  if (modFileContent !== fileContent) {
    const cm = editor.cm
    const { line, ch } = cm.getCursor()
    cm.rewriting = true   // <- this is important, see below
    cm.setValue(modFileContent)
    cm.setCursor(line, ch)
  }
}

export default {
  key: 'basic',
  getEventListeners () {
    return {
      change: (cm, change) => {
        // code in collaboration plugin treat "change.origin === 'setValue'" as initial load of file content,
        // and react with a noop, thus we need to override it to distinguish the case
        if (change.origin === 'setValue' && cm.rewriting) {
          change.origin = 'rewrite'
          cm.rewriting = false
        }
        const { editor } = this.props
        if (!editor.file) return
        editor.file.isSynced = false

        FileStore.updateFile({
          id: editor.file.id,
          content: cm.getValue(),
        })

        debounced(() => {
          changeInterceptor(editor)
          dispatchCommand('file:save')
        })
      },

      focus: () => {
        const { editor } = this.props
        TabStore.activateTab(editor.tab.id)
      },
    }
  },
}
