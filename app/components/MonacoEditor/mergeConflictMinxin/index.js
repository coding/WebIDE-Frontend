import { remove } from 'lodash'
import { scanDocument, matchesToDescriptor, containsConflict } from './mergeConflictParser'

const overviewRulerColors = {
  current: 'rgba(64, 200, 174, 0.5)',
  incoming: 'rgba(64, 166, 255, 0.5)'
}
const CommitType = {
  CURRENT: 0,
  INCOMING: 1,
  BOTH: 2,
}

function getLanguages () {
  const languages = []
  for (const language of monaco.languages.getLanguages().map(l => l.id)) {
    if (languages.indexOf(language) === -1) {
      languages.push(language)
    }
  }
  return languages
}

const MergeConflictMinxin = {
  key: 'mergeConflict',
  componentWillMount () {
    this.conflicts = []
    this.headerDecorations = []
    this.contentDecorations = []
    this.descriptors = []
    const { monacoEditor } = this.editor
    if (!monacoEditor) {
      throw new Error("Can'\t find editor.")
    }

    const textModel = monacoEditor.getModel()
    if (!textModel) {
      monacoEditor.onDidChangeModel(() => {
        const newModel = monacoEditor.getModel()
        newModel.onDidChangeContent(this.contentChangeHandler.bind(this))
      })
    } else {
      const content = textModel.getValue()
      if (containsConflict(content)) {
        this.conflicts = scanDocument(textModel)
        if (this.conflicts && this.conflicts.length > 0) {
          this.matchesToDescriptors.bind(this)()
        }
      }
      textModel.onDidChangeContent(this.contentChangeHandler.bind(this))
    }

  },
  componentDidMount () {
    if (this.conflicts && this.conflicts.length > 0) {
      this.registerCodeLensProvider.bind(this)(this.conflicts)
    }
  },
  componentWillUnMount () {
    console.log('unmount')
  },
  contentChangeHandler () {
    const textModel = this.editor.monacoEditor.getModel()
    const conflicts = scanDocument(textModel)

    if (conflicts.length > 0) {
      this.conflicts = conflicts
      this.matchesToDescriptors.bind(this)()
    }
  },
  registerCodeLensProvider () {
    const { monacoEditor } = this.editor
    const textModel = monacoEditor.getModel()
    const providers = []
    const acceptCurrentCommand = monacoEditor.addCommand(-1, (...args) => {
      let conflict
      let index
      if (args[1] === 'known-conflict') {
        conflict = args[2]
      }
      if (typeof args[3] === 'number') {
        index = args[3]
      }
      this.commitMergeEdit.bind(this)(CommitType.CURRENT, conflict, index)
    }, '')
    const acceptIncomingCommand = monacoEditor.addCommand(-1, (...args) => {
      let conflict
      let index
      if (args[1] === 'known-conflict') {
        conflict = args[2]
      }
      if (typeof args[3] === 'number') {
        index = args[3]
      }
      this.commitMergeEdit.bind(this)(CommitType.INCOMING, conflict, index)
    }, '')
    const acceptBothCommand = monacoEditor.addCommand(-1, (...args) => {
      let conflict
      if (args[1] === 'known-conflict') {
        conflict = args[2]
      }
      this.commitMergeEdit.bind(this)(CommitType.BOTH, conflict, -1)
    }, '')
    const codeLensProvider = {
      provideCodeLenses: (model, token) => {
        const conflicts = scanDocument(textModel)
        if (!conflicts || conflicts.length === 0 || textModel.uri.path !== model.uri.path) {
          return null
        }
        let codelens = []
        conflicts.forEach((conflict, index) => {
          const range = {
            startLineNumber: conflict.startHeader.lineNumber,
            startColumn: conflict.startHeader.lineNumber,
            endLineNumber: conflict.startHeader.lineNumber + 1,
            endColumn: conflict.startHeader.lineNumber
          }
          codelens = codelens.concat([
            {
              range,
              id: 0,
              command: {
                id: acceptCurrentCommand,
                title: '采用当前更改',
                arguments: ['known-conflict', conflict, index]
              }
            },
            {
              range,
              id: 1,
              command: {
                id: acceptIncomingCommand,
                title: '采用传入更改',
                arguments: ['known-conflict', conflict, index]
              }
            },
            {
              range,
              id: 2,
              command: {
                id: acceptBothCommand,
                title: '保留双方更改',
                arguments: ['known-conflict', conflict, -1]
              }
            }
          ])
        })
        return codelens
      },
      resolveCodeLens: (model, codeLens, token) => {
        return codeLens
      }
    }
    for (const language of getLanguages()) {
      providers.push(
        monaco.languages.registerCodeLensProvider(language, codeLensProvider)
      )
    }
    this.providers = providers
  },
  commitMergeEdit (type, conflict, index) {
    const { monacoEditor } = this.editor
    const textModel = monacoEditor.getModel()
    const descriptor = matchesToDescriptor(conflict, textModel)

    if (type === CommitType.CURRENT) {
      const range = descriptor.current.content
      const content = textModel.getValueInRange(range)

      this.replaceRangeWithContent.bind(this)(descriptor.range, content)
      this.clearDecorations.bind(this)(index)
    } else if (type === CommitType.INCOMING) {
      const range = descriptor.incoming.content
      const content = textModel.getValueInRange(range)

      this.replaceRangeWithContent.bind(this)(descriptor.range, content)
      this.clearDecorations.bind(this)(index)
    } else {
      //
      this.clearDecorations()
    }
  },
  replaceRangeWithContent (range, content) {
    const { monacoEditor } = this.editor
    const textModel = monacoEditor.getModel()
    console.log(range, content)
    const editOperations = [
      {
        range,
        text: content,
        forceMoveMarkers: true
      }
    ]
    textModel.pushEditOperations([], editOperations)
  },
  matchesToDescriptors () {
    const textModel = this.editor.monacoEditor.getModel()
    this.descriptors = this.conflicts.map(match => matchesToDescriptor(match, textModel))
    if (this.descriptors && this.descriptors.length > 0) {
      this.applyConflictsDecoration.bind(this)(this.descriptors)
    }
  },
  applyConflictsDecoration (descriptors) {
    this.headerDecorations = []
    this.contentDecorations = []
    for (let index = 0; index < descriptors.length; index += 1) {
      const {
        current,
        incoming,
      } = descriptors[index]

      this.applyCurrentAndIncomingDescriptor.bind(this)(current, 'current', index)
      this.applyCurrentAndIncomingDescriptor.bind(this)(incoming, 'incoming', index)
    }
    console.log(this.headerDecorations)
    console.log(this.contentDecorations)
  },
  applyCurrentAndIncomingDescriptor (descriptor, type, index) {
    const { monacoEditor } = this.editor
    const { header, name, content, decoratorContent } = descriptor
    // render header
    const headerDecoration = [
      {
        range: header,
        options: {
          isWholeLine: true,
          className: `.${type}-conflict-header`,
          afterContentClassName: `.${type}-conflict-header-after-decoration`,
          overviewRuler: {
            color: overviewRulerColors[type],
            darkColor: overviewRulerColors[type],
            position: 4
          }
        }
      }
    ]
    const oldHeaderDecoration = this.headerDecorations[index] && this.headerDecorations[index][type]
    const newHeaderDecoration = monacoEditor.deltaDecorations(
      oldHeaderDecoration || [],
      headerDecoration
    )
    if (!this.headerDecorations[index]) {
      this.headerDecorations.push({})
    }
    this.headerDecorations[index] = {
      ...this.headerDecorations[index],
      [type]: newHeaderDecoration
    }
    // render content
    const contentDecoration = [
      {
        range: decoratorContent,
        options: {
          isWholeLine: true,
          className: `.${type}-conflict-content`,
          overviewRuler: {
            color: overviewRulerColors[type],
            darkColor: overviewRulerColors[type],
            position: 4
          }
        }
      }
    ]
    const oldContentDecoration =
      this.contentDecorations[index] && this.contentDecorations[index][type]
    const newContentDecoration = monacoEditor.deltaDecorations(
      oldContentDecoration || [],
      contentDecoration
    )
    if (!this.contentDecorations[index]) {
      this.contentDecorations.push({})
    }
    this.contentDecorations[index] = {
      ...this.contentDecorations[index],
      [type]: newContentDecoration
    }
  },
  clearDecorations (index) {
    if (this.headerDecorations && this.headerDecorations.length > 0) {
      if (index >= 0) {
        const decoration = this.headerDecorations[index]
        this._clearDecoration.bind(this)(decoration)
        remove(this.headerDecorations, (_, i) => i === index)
      } else {
        this.headerDecorations.forEach(this._clearDecoration.bind(this))
        this.headerDecorations = []
      }
    }

    if (this.contentDecorations && this.contentDecorations.length > 0) {
      if (index >= 0) {
        const decoration = this.contentDecorations[index]
        this._clearDecoration.bind(this)(decoration)
        remove(this.contentDecorations, (_, i) => i === index)
      } else {
        this.contentDecorations.forEach(this._clearDecoration.bind(this))
        this.contentDecorations = []
      }
    }
  },
  _clearDecoration (decoration) {
    if (!decoration) return false
    const { monacoEditor } = this.editor
    const { current, incoming } = decoration
    if (current || incoming) {
      monacoEditor.deltaDecorations([...current, ...incoming], [])
    }
  }
}

export default MergeConflictMinxin
