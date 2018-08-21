import * as monaco from 'monaco-editor'

export const cacheConflicts = new Map()
const offsetGroups = [1, 3, 4, 5, 6]
const startHeaderMarker = '<<<<<<<'
const commonAncestorsMarker = '|||||||'
const splitterMarker = '======='
const endFooterMarker = '>>>>>>>'

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

function getMatchPosition (model, match, groupIndex) {
  let offsets = offsetGroups
  if (!offsets) {
    offsets = match.map((i, idx) => idx)
  }

  let start = match.index

  for (let i = 0; i < offsetGroups.length; i += 1) {
    const value = offsetGroups[i]

    if (value >= groupIndex) {
      break
    }

    start += match[value] !== undefined ? match[value].length : 0
  }
  const groupMatch = match[groupIndex]
  const targetMatchLength = groupMatch !== undefined ? groupMatch.length : -1
  let end = (start + targetMatchLength)
  if (groupMatch !== undefined) {
    // Move the end up if it's capped by a trailing \r\n, this is so regions don't expand into
    // the line below, and can be "pulled down" by editing the line below
    if (match[groupIndex].lastIndexOf('\n') === targetMatchLength - 1) {
      end -= 1

      // .. for windows encodings of new lines
      if (match[groupIndex].lastIndexOf('\r') === targetMatchLength - 2) {
        end -= 1
      }
    }
  }

  return new monaco.Range(model.getPositionAt(start), model.getPositionAt(end))
}

function shiftBackOneCharacter (model, startLineNumber, startColumn, endLineNumber, endColumn) {
  const range = new monaco.Range(startLineNumber, startColumn, startLineNumber, startColumn)
  const unlessEqual = new monaco.Range(endLineNumber, endColumn, endLineNumber, endColumn)
  if (range.equalsRange(unlessEqual)) {
    return range
  }

  let line = range.line
  let character = range.character - 1

  if (character < 0) {
    line -= 1
    character = lineAt(model, line).range.end.character
  }

  return new monaco.Position(line, character)
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
        shiftBackOneCharacter(
          model,
          tokenAfterCurrentBlock.range.startLineNumber,
          tokenAfterCurrentBlock.range.startColumn,
          match.startHeader.rangeIncludingLineBreak.endLineNumber,
          match.startHeader.rangeIncludingLineBreak.endColumn,
        )
      ),
      content: new monaco.Range(
        match.startHeader.rangeIncludingLineBreak.end,
        tokenAfterCurrentBlock.range.start
      ),
      name: match.startHeader.text.substring(startHeaderMarker.length + 1)
    },
    commonAncestors: match.commonAncestors.map((currentTokenLine, index, commonAncestors) => {
      const nextTokenLine = commonAncestors[index + 1] || match.splitter
      return {
        header: currentTokenLine.range,
        decoratorContent: new monaco.Range(
          currentTokenLine.rangeIncludingLineBreak.end,
          MergeConflictParser.shiftBackOneCharacter(document, nextTokenLine.range.start, currentTokenLine.rangeIncludingLineBreak.end)),
        content: new monaco.Range(
          currentTokenLine.rangeIncludingLineBreak.end,
          nextTokenLine.range.start),
        name: currentTokenLine.text.substring(commonAncestorsMarker.length + 1)
      }
    }),
    splitter: match.splitter.range,
    incoming: {
      header: match.endFooter.range,
      decoratorContent: new monaco.Range(
        match.splitter.rangeIncludingLineBreak.end,
        shiftBackOneCharacter(model, match.endFooter.range.start, match.splitter.rangeIncludingLineBreak.end)
      ),
      content: new monaco.Range(
        match.splitter.rangeIncludingLineBreak.end,
        match.endFooter.range.start
      ),
      name: match.endFooter.text.substring(endFooterMarker.length + 1)
    },
    range: new monaco.Range(match.startHeader.range.start, match.endFooter.rangeIncludingLineBreak.end)
  }
}
