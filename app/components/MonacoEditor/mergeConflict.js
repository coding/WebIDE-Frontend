import * as monaco from 'monaco-editor'

export const cacheConflicts = new Map()

const startHeaderMarker = '<<<<<<<'
const commonAncestorsMarker = '|||||||'
const splitterMarker = '======='
const endFooterMarker = '>>>>>>>'
const currentHeaderColor = 'rgba(64, 200, 174, 0.5)'
const currentContentColor = 'rgba(64, 200, 174, 0.2)'
const incomingContentColor = 'rgba(64, 166, 255, 0.2)'
const incomingHeaderColor = 'rgba(64, 166, 255, 0.5)'
const commonBaseColor = '#606060'

export const Colors = {
  currentHeaderColor,
  currentContentColor,
  incomingHeaderColor,
  incomingContentColor,
  commonBaseColor,
}

export function hasCache (key) {
  return cacheConflicts.has(key)
}

function lineAt (model, lineNumber) {
  const lineContent = model.getLineContent(lineNumber)
  const lineCount = model.getLineCount()
  const range = new monaco.Range(lineNumber, 0, lineNumber, lineContent.length)
  const firstNonWhitespaceCharacterIndex = /^(\s*)/.exec(lineContent)[1].length
  const line = {
    lineNumber,
    text: lineContent,
    range,
    rangeIncludingLineBreak: lineNumber < lineCount - 1
      ? new monaco.Range(lineNumber, 0, lineNumber + 1, 0)
      : range,
    firstNonWhitespaceCharacterIndex,
    isEmptyOrWhitespace: firstNonWhitespaceCharacterIndex === lineContent.length
  }
  return line
}

export function scanDocument (model) {
  const lineCount = model.getLineCount()
  const conflicts = []

  let currentConflict = null
  for (let i = 0; i < lineCount; i += 1) {
    const lineNumber = i + 1
    const line = lineAt(model, lineNumber)

    if (!line || line.isEmptyOrWhitespace) {
      continue
    }

    if (line.text.startsWith(startHeaderMarker)) {
      if (currentConflict !== null) {
        break
      }

      currentConflict = { startHeader: line, commonAncestors: [] }
    } else if (currentConflict && !currentConflict.splitter && line.text.startsWith(commonAncestorsMarker)) {
      currentConflict.commonAncestors.push(line)
    } else if (currentConflict && !currentConflict.splitter && line.text.startsWith(splitterMarker)) {
      currentConflict.splitter = line
    } else if (currentConflict && line.text.startsWith(endFooterMarker)) {
      currentConflict.endFooter = line
      conflicts.push(currentConflict)
      currentConflict = null
    }
  }

  return conflicts
}

export function containsConflict (content) {
  if (!content || content === '') {
    return false
  }
  return content.includes('<<<<<<<') && content.includes('>>>>>>>')
}

function shiftBackOneCharacter (model, start, end) {
  const range = new monaco.Range(start.lineNumber, start.column, start.lineNumber, start.column)
  const unlessEqual = new monaco.Range(end.lineNumber, end.column, end.lineNumber, end.column)
  if (range.equalsRange(unlessEqual)) {
    return range
  }

  let line = range.startLineNumber
  let character = range.startColumn - 1

  if (character < 0) {
    line -= 1
    character = lineAt(model, line).range.endColumn
  }

  const { lineNumber, column } = new monaco.Position(line, character)
  return [lineNumber, column]
}

export function matchesToDescriptor (match, model) {
  if (!match.startHeader || !match.splitter || !match.endFooter) {
    return null
  }

  const tokenAfterCurrentBlock = match.commonAncestors[0] || match.splitter

  return {
    current: {
      header: match.startHeader.range,
      decoratorContent: new monaco.Range(
        match.startHeader.rangeIncludingLineBreak.endLineNumber,
        match.startHeader.rangeIncludingLineBreak.endColumn,
        ...shiftBackOneCharacter(
          model,
          {
            lineNumber: tokenAfterCurrentBlock.range.startLineNumber,
            column: tokenAfterCurrentBlock.range.startColumn
          },
          {
            lineNumber: match.startHeader.rangeIncludingLineBreak.endLineNumber,
            column: match.startHeader.rangeIncludingLineBreak.endColumn
          },
        )
      ),
      content: new monaco.Range(
        match.startHeader.rangeIncludingLineBreak.endLineNumber,
        match.startHeader.rangeIncludingLineBreak.endColumn,
        tokenAfterCurrentBlock.range.startLineNumber,
        tokenAfterCurrentBlock.range.startColumn,
      ),
      name: match.startHeader.text.substring(startHeaderMarker.length + 1)
    },
    commonAncestors: match.commonAncestors.map((currentTokenLine, index, commonAncestors) => {
      const nextTokenLine = commonAncestors[index + 1] || match.splitter
      return {
        header: currentTokenLine.range,
        decoratorContent: new monaco.Range(
          currentTokenLine.rangeIncludingLineBreak.endLineNumber,
          currentTokenLine.rangeIncludingLineBreak.endColumn,
          ...shiftBackOneCharacter(
            model,
            {
              lineNumber: nextTokenLine.range.startLineNumber,
              column: nextTokenLine.range.startColumn,
            },
            {
              lineNumber: currentTokenLine.rangeIncludingLineBreak.endLineNumber,
              column: currentTokenLine.rangeIncludingLineBreak.endColumn,
            }
          )
        ),
        content: new monaco.Range(
          currentTokenLine.rangeIncludingLineBreak.endLineNumber,
          currentTokenLine.rangeIncludingLineBreak.endColumn,
          nextTokenLine.range.startLineNumber,
          nextTokenLine.range.startColumn,
        ),
        name: currentTokenLine.text.substring(commonAncestorsMarker.length + 1)
      }
    }),
    splitter: match.splitter.range,
    incoming: {
      header: match.endFooter.range,
      decoratorContent: new monaco.Range(
        match.splitter.rangeIncludingLineBreak.endLineNumber,
        match.splitter.rangeIncludingLineBreak.endColumn,
        ...shiftBackOneCharacter(
          model,
          {
            lineNumber: match.endFooter.range.startLineNumber,
            column: match.endFooter.range.startColumn,
          },
          {
            lineNumber: match.splitter.rangeIncludingLineBreak.endLineNumber,
            column: match.splitter.rangeIncludingLineBreak.endColumn,
          }
        )
      ),
      content: new monaco.Range(
        match.splitter.rangeIncludingLineBreak.endLineNumber,
        match.splitter.rangeIncludingLineBreak.endColumn,
        match.endFooter.range.startLineNumber,
        match.endFooter.range.startColumn,
      ),
      name: match.endFooter.text.substring(endFooterMarker.length + 1)
    },
    range: new monaco.Range(
      match.startHeader.range.startLineNumber,
      match.startHeader.range.startColumn,
      match.endFooter.rangeIncludingLineBreak.endLineNumber,
      match.endFooter.rangeIncludingLineBreak.endColumn,
    )
  }
}
