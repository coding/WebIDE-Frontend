import CodeMirror from 'codemirror'
import eslintService from './eslintService'

function getPos (error, from) {
  let line = error.line - 1, ch = from ? error.column : error.column + 1
  if (error.node && error.node.loc) {
    line = from ? error.node.loc.start.line - 1 : error.node.loc.end.line - 1
    ch = from ? error.node.loc.start.column : error.node.loc.end.column
  }
  return CodeMirror.Pos(line, ch)
}

function getSeverity (error) {
  switch (error.severity) {
    case 1: return 'warning'
    case 2: return 'error'
    default: return 'error'
  }
}

const annotationFormatter = annotation => ({
  message: `[eslint] ${annotation.message} (${annotation.ruleId})`,
  severity: getSeverity(annotation),
  from: getPos(annotation, true),
  to: getPos(annotation, false)
})

export default function linterFactory (handleLinterError) {
  return function linter (text, returnAnnotations, options, cm) {
    if (!options.enabled) {
      return returnAnnotations([])
    }
    const filePath = cm._editor.filePath
    const promise = filePath ? eslintService.executeOnFile(filePath) : eslintService.executeOnText(text)
    promise.then((results) => {
      results = JSON.parse(results)
      if (results.error) {
        return handleLinterError(results, cm)
      }
      const annotations = results.messages.map(annotationFormatter)
      returnAnnotations(annotations)
    }).catch((error) => {
      /* Two possibile cases here:
      * 1. the backend fails, not 200 OK.
      * 2. most likely `results` is NOT a json string,
      *    or other case where previous `.then(results => ...)` does not work properly
      *
      * Should we just let it fail quietly?
      */
      handleLinterError(error, cm)
    })
  }
}
