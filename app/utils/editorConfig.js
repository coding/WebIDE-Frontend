import { FileState, store as FileStore } from 'commons/File'
import { observable, reaction } from 'mobx'
import { isNumber } from 'utils/is'

// Taken from https://github.com/editorconfig/editorconfig-core-js/blob/master/lib/ini.js
const regex = {
  section: /^\s*\[(([^#;]|\\#|\\;)+)\]\s*([#;].*)?$/,
  param: /^\s*([\w\.\-\_]+)\s*[=:]\s*(.*?)\s*([#;].*)?$/,
  comment: /^\s*[#;].*$/,
}

function parseParam (key, val) {
  function getValidValue (value) {
    switch (key) {
      case 'indent_style':
        return ['tab', 'space'].includes(value) ? value : null

      case 'end_of_line':
        return ['lf', 'cr', 'crlf'].includes(value) ? value : null

      case 'indent_size':
      case 'tab_width':
        value = Number(value)
        return isNumber(value) && value >= 1 ? Math.floor(value) : null

      case 'insert_final_newline':
      case 'trim_trailing_whitespace':
        return ['true', 'false'].includes(value) ? (value === 'true') : null

      default:
        return null
    }
  }
  const validValue = getValidValue(val)
  if (validValue === null) return [null, null]
  return [key, validValue]
}

function parseString (data) {
  let sectionBody = {}
  let sectionName = null
  const value = [[sectionName, sectionBody]]
  const lines = data.split(/\r\n|\r|\n/)
  lines.forEach((line) => {
    if (regex.comment.test(line)) return
    if (regex.param.test(line)) {
      const match = line.match(regex.param)
      const [paramKey, paramValue] = parseParam(match[1], match[2])
      if (paramKey) sectionBody[paramKey] = paramValue
    } else if (regex.section.test(line)) {
      const match = line.match(regex.section)
      sectionName = match[1]
      sectionBody = {}
      value.push([sectionName, sectionBody])
    }
  })
  // get rid of useless 1st item "[ null, { root: true } ]"
  return value.splice(1)
}

const editorConfig = observable({
  isEnabled: false,
  content: '',
  keys: [
    'indent_style',
    'indent_size',
    'tab_width',
    'trim_trailing_whitespace',
    'insert_final_newline'
  ],
  get rules () {
    const parsed = parseString(this.content)
    return parsed.reduce((rules, [sectionName, sectionBody]) =>
      (rules[sectionName] = sectionBody) && rules
    , {})
  }
})

reaction(() => {
  const isEditorConfigEnabled = FileState.entities.has('/.editorconfig')
  const editorConfigFile = isEditorConfigEnabled ? FileState.entities.get('/.editorconfig') : {}
  return {
    isEnabled: isEditorConfigEnabled,
    content: editorConfigFile.content
  }
}, ({ isEnabled, content }) => {
  if (!isEnabled) return editorConfig.isEnabled = false
  editorConfig.isEnabled = true
  if (!content) {
    FileStore.syncFile('/.editorconfig').then((file) => {
      editorConfig.content = file.content
    })
  } else if (editorConfig.content !== content) {
    editorConfig.content = content
  }
})


export default editorConfig
