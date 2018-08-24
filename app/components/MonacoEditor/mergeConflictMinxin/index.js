import { isEqual } from 'lodash'
import { scanDocument, matchesToDescriptor, containsConflict } from './mergeConflictParser'

const MergeConflictMinxin = {
  key: 'mergeConflict',
  componentWillMount () {
    this.conflicts = []
    this.viewzones = []
    this.headerDecorations = [{}, {}]
    this.contentDecorations = [{}, {}]
    this.headerWidgets = []
    const { monacoEditor } = this.editor
    if (!monacoEditor) {
      throw new Error("Can'\t find editor.")
    }

    const textModel = monacoEditor.getModel()
    if (!textModel) {
      monacoEditor.onDidChangeModel(() => {
        const newModel = monacoEditor.getModel()
        newModel.onDidChangeContent(this.contentContentHandler.bind(this))
      })
    } else {
      const content = textModel.getValue()
      if (containsConflict(content)) {
        this.conflicts = scanDocument(textModel)
        if (this.conflicts && this.conflicts.length > 0) {
          this.matchesToDescriptors.bind(this)()
        }
      }
      textModel.onDidChangeContent(this.contentContentHandler.bind(this))
    }
  },
  contentContentHandler () {
    const textModel = this.editor.monacoEditor.getModel()
    const conflicts = scanDocument(textModel)

    if (!isEqual(conflicts, this.conflicts) && conflicts.length > 0) {
      this.conflicts = conflicts
      this.matchesToDescriptors.bind(this)()
    } else {
      this.clearDecoration.bind(this)()
      this.conflicts = conflicts
    }
  },
  matchesToDescriptors () {
    const textModel = this.editor.monacoEditor.getModel()
    const descriptors = this.conflicts.map(match => matchesToDescriptor(match, textModel))
    if (descriptors && descriptors.length > 0) {
      this.applyConflictsDecoration.bind(this)(descriptors)
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
      monacoEditor.changeViewZones((changeAccessor) => {
        const domNode = document.createElement('div')
        if (this.viewzones[index]) {
          changeAccessor.removeZone(this.viewzones[index])
        }
        const zoneId = changeAccessor.addZone({
          afterLineNumber: startLineNumber - 1,
          heightInLines: 1,
          domNode
        })
        this.viewzones[index] = zoneId
      })

      const headerWidget = {
        domNode: null,
        allowEditorOverflow: true,
        getId: () => `conflict-header-widget-${index}`,
        getDomNode: () => {
          if (!this.domNode) {
            this.domNode = document.createElement('span')
            this.domNode.innerHTML = `
            <a class="accept-current">采用当前更改</a> 
            | <a class="accept-incoming">采用传入的更改</a> 
            | <a class="accept-both">保留双方更改</a>`
            this.domNode.className = 'conflict-header-widget'
          }
          return this.domNode
        },
        getPosition: () => ({
          position: {
            lineNumber: startLineNumber - 1,
            column: 1
          },
          preference: [monaco.editor.ContentWidgetPositionPreference.BELOW]
        })
      }

      if (this.headerWidgets[index]) {
        monacoEditor.removeContentWidget(this.headerWidgets[index])
      }
      monacoEditor.addContentWidget(headerWidget)
      this.headerWidgets[index] = headerWidget

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
          afterContentClassName: `.${type}-conflict-header-after-decoration`
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
          className: `.${type}-conflict-content`
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
        monacoEditor.removeContentWidget(this.headerWidgets[index])
        this.headerWidgets[index] = undefined
      } else {
        this.headerWidgets.forEach(widget => monacoEditor.removeContentWidget(widget))
        this.headerWidgets = []
      }
    }

    if (this.viewzones && this.viewzones.length > 0) {
      if (index) {
        monacoEditor.changeViewZones((changeAccessor) => {
          changeAccessor.removeZone(this.viewzones[index])
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
