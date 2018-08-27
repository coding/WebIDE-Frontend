import { isEqual } from 'lodash'
import { scanDocument, matchesToDescriptor, containsConflict } from './mergeConflictParser'

const CONTENT_WIDGET = 9
const overviewRulerColors = {
  current: 'rgba(64, 200, 174, 0.5)',
  incoming: 'rgba(64, 166, 255, 0.5)'
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
    this.viewzones = []
    this.headerDecorations = [{}, {}]
    this.contentDecorations = [{}, {}]
    this.headerWidgets = []
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

    monacoEditor.onMouseDown(this.mouseDownHandler.bind(this))
  },
  componentDidMount () {
    if (this.conflicts && this.conflicts.length > 0) {
      this.registerCodeLensProvider.bind(this)(this.conflicts)
    }
  },
  componentWillUnMount () {
    console.log('unmount')
  },
  mouseDownHandler (e) {
    const { monacoEditor } = this.editor
    if (e.target.type === CONTENT_WIDGET) {
      const className = e.target.element.className
      if (className.startsWith('accept-')) {
        const conflictIndex = e.target.detail.split('-').pop()
        const currentConflict = this.descriptors[conflictIndex]
        const textModel = monacoEditor.getModel()
        switch (className) {
          case 'accept-current': {
            const { incoming, current } = currentConflict
            const operations = [
              { range: current.header, text: '' },
              { range: incoming.header, text: '' },
              { range: incoming.content, text: '' }
            ]
            textModel.pushEditOperations([], operations)
            // const incomingRange = 
            break
          }
            // console.log()
          case 'accept-incoming':
          case 'accept-both':
          default:
            break
        }
      }
    }
  },
  contentChangeHandler () {
    const textModel = this.editor.monacoEditor.getModel()
    const conflicts = scanDocument(textModel)
    // if (!isEqual(this.conflicts, conflicts)) {
    //   if (this.providers && this.providers.length > 0) {
    //     console.log('dispose')
    //     this.providers.forEach((p) => p.dispose())
    //     this.providers = []
    //     this.registerCodeLensProvider.bind(this)(conflicts)
    //   }
    // }

    if (conflicts.length > 0) {
      this.conflicts = conflicts
      this.matchesToDescriptors.bind(this)()
    }
  },
  registerCodeLensProvider () {
    const { monacoEditor } = this.editor
    const textModel = monacoEditor.getModel()
    const providers = []
    const acceptCurrentCommand = monacoEditor.addCommand(-1, (e) => {
      console.log(e)
    }, '')
    const acceptIncomingCommand = monacoEditor.addCommand(-1, (e) => {
      console.log(e)
    }, '')
    const acceptBothCommand = monacoEditor.addCommand(-1, (e) => {
      console.log(e)
    }, '')
    const codeLensProvider = {
      provideCodeLenses: (model, token) => {
        const conflicts = scanDocument(textModel)
        if (!conflicts || conflicts.length === 0 || textModel.uri.path !== model.uri.path) {
          return null
        }
        let codelens = []
        conflicts.forEach((conflict) => {
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
                arguments: ['known-conflict', conflict]
              }
            },
            {
              range,
              id: 1,
              command: {
                id: acceptIncomingCommand,
                title: '采用传入更改',
                arguments: ['known-conflict', conflict]
              }
            },
            {
              range,
              id: 2,
              command: {
                id: acceptBothCommand,
                title: '保留双方更改',
                arguments: ['known-conflict', conflict]
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
  matchesToDescriptors () {
    const textModel = this.editor.monacoEditor.getModel()
    this.descriptors = this.conflicts.map(match => matchesToDescriptor(match, textModel))
    if (this.descriptors && this.descriptors.length > 0) {
      this.applyConflictsDecoration.bind(this)(this.descriptors)
    }
  },
  applyConflictsDecoration (descriptors) {
    const { monacoEditor } = this.editor
    for (let index = 0; index < descriptors.length; index += 1) {
      const {
        current,
        incoming,
        range: { startLineNumber }
      } = descriptors[index]

      this.applyCurrentAndIncomingDescriptor.bind(this)(current, 'current', index)
      this.applyCurrentAndIncomingDescriptor.bind(this)(incoming, 'incoming', index)
    }
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
    this.headerDecorations[index][type] = monacoEditor.deltaDecorations(
      oldHeaderDecoration || [],
      headerDecoration
    )
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
    this.contentDecorations[index][type] = monacoEditor.deltaDecorations(
      oldContentDecoration || [],
      contentDecoration
    )
  },
  clearDecoration (index) {
    const { monacoEditor } = this.editor
    if (this.headerWidgets && this.headerWidgets.length > 0) {
      if (index) {
        this.headerWidgets[index] && monacoEditor.removeContentWidget(this.headerWidgets[index])
        this.headerWidgets[index] = undefined
      } else {
        this.headerWidgets.forEach(widget => {
          monacoEditor.removeContentWidget(widget)
        })
        this.headerWidgets = []
      }
    }

    if (this.viewzones && this.viewzones.length > 0) {
      if (index) {
        monacoEditor.changeViewZones((changeAccessor) => {
          this.viewzones[index] && changeAccessor.removeZone(this.viewzones[index])
          this.viewzones[index] = undefined
        })
      } else {
        monacoEditor.changeViewZones((changeAccessor) => {
          this.viewzones.forEach(changeAccessor.removeZone)
        })
        this.viewzones = []
      }
    }

    if (this.headerDecorations && this.headerDecorations.length > 0) {
      if (index) {
      } else {
        this.headerDecorations.forEach((decoration) => {
          const { current, incoming } = decoration
          if (current || incoming) {
            monacoEditor.deltaDecorations([...current, ...incoming], [])
          }
        })
        this.headerDecorations = [{}, {}]
      }
    }

    if (this.contentDecorations && this.contentDecorations.length > 0) {
      if (index) {
      } else {
        this.contentDecorations.forEach((decoration) => {
          const { current, incoming } = decoration
          if (current || incoming) {
            monacoEditor.deltaDecorations([...current, ...incoming], [])
          }
        })
        this.contentDecorations = [{}, {}]
      }
    }
  }
}

export default MergeConflictMinxin
