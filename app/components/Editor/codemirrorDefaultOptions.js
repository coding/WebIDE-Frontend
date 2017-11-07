// precisely, these are the default options that we want to override
const options = {
  theme: 'default',
  autofocus: true,
  lineNumbers: true,
  lint: null,
  matchBrackets: true,
  autoCloseBrackets: true,
  dragDrop: false,
  trimTrailingWhitespace: undefined,
  insertFinalNewline: undefined,
  smartIndent: false,
  extraKeys: {
    Tab: function betterTab (cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection('add')
      } else {
        cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t' :
          Array(cm.getOption('indentUnit') + 1).join(' '), 'end', '+input'
        )
      }
    }
  }
}

export default options
