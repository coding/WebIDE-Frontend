import _ from 'lodash'
import ace from 'brace'
var aceRange = ace.acequire('ace/range')
Range = aceRange.Range

import { diff_match_patch } from 'diff_match_patch'

var C = {
  DIFF_EQUAL: 0,
  DIFF_DELETE: -1,
  DIFF_INSERT: 1,
  EDITOR_RIGHT: 'right',
  EDITOR_LEFT: 'left',
  EDITOR_MIDDLE: 'middle',
  RTL: 'rtl',
  LTR: 'ltr',
  SVG_NS: 'http://www.w3.org/2000/svg',
  DIFF_GRANULARITY_SPECIFIC: 'specific',
  DIFF_GRANULARITY_BROAD: 'broad'
}

var AceMerge = function (options) {
  this.options = _.merge( {
      mode: null,
      theme: null,
      diffGranularity: C.DIFF_GRANULARITY_BROAD,
      lockScrolling: false, // not implemented yet
      showDiffs: true,
      showConnectors: true,
      maxDiffs: 5000,
      left: {
        id: 'acediff-left-editor',
        content: null,
        mode: null,
        theme: null,
        editable: true,
        copyLinkEnabled: true
      },
      right: {
        id: 'acediff-right-editor',
        content: null,
        mode: null,
        theme: null,
        editable: true,
        copyLinkEnabled: true
      },
      middle: {
        id: 'acediff-middle-editor',
        content: null,
        mode: null,
        theme: null,
        editable: true,
        copyLinkEnabled: true
      },
      classes: {
        gutterID: 'acediff-gutter',
        diff: 'acediff-diff',
        connector: 'acediff-connector',
        newCodeConnectorLink: 'acediff-new-code-connector-copy',
        newCodeConnectorLinkContent: '&#8594;',
        deletedCodeConnectorLink: 'acediff-deleted-code-connector-copy',
        deletedCodeConnectorLinkContent: '&#8592;',
        copyRightContainer: 'acediff-copy-right',
        copyLeftContainer: 'acediff-copy-left'
      },
      connectorYOffset: 0
    }, options);

    this.editors = {
      left: {
        ace: ace.edit(this.options.left.id),
        markers: [],
        lineLengths: []
      },
      right: {
        ace: ace.edit(this.options.right.id),
        markers: [],
        lineLengths: []
      },
      middle: {
        ace: ace.edit(this.options.middle.id),
        markers: [],
        lineLengths: []
      },
      editorHeight: null
    };

    if (this.options.left) {
      this.editors.left.ace.$blockScrolling = Infinity
      this.editors.left.ace.getSession().setMode(getMode(this, C.EDITOR_LEFT))
      this.editors.left.ace.setReadOnly(!this.options.left.editable)
      this.editors.left.ace.setTheme(getTheme(this, C.EDITOR_LEFT))
      if (this.options.left.content) {
        this.editors.left.ace.setValue(this.options.left.content, -1)
      }
    }

    if (this.options.middle) {
      this.editors.middle.ace.$blockScrolling = Infinity
      this.editors.middle.ace.getSession().setMode(getMode(this, C.EDITOR_MIDDLE))
      this.editors.middle.ace.setReadOnly(!this.options.middle.editable)
      this.editors.middle.ace.setTheme(getTheme(this, C.EDITOR_MIDDLE))
      if (this.options.middle.content) {
        this.editors.middle.ace.setValue(this.options.middle.content, -1)
      }
    }

    if (this.options.right) {
      this.editors.right.ace.$blockScrolling = Infinity
      this.editors.right.ace.getSession().setMode(getMode(this, C.EDITOR_RIGHT))
      this.editors.right.ace.setReadOnly(!this.options.right.editable)
      this.editors.right.ace.setTheme(getTheme(this, C.EDITOR_RIGHT))
      if (this.options.right.content) {
        this.editors.right.ace.setValue(this.options.right.content, -1)
      }
    }

    addEventHandlers(this)

    this.lineHeight = this.editors.left.ace.renderer.lineHeight || 16

    createCopyContainers(this)
    createGutter(this)

    this.editors.editorHeight = getEditorHeight(this)
    this.diff()
}

AceMerge.prototype = {
  setOptions: (options) => {
    this.options = _.merge(this.options, options)
    this.diff()
  },
  getNumDiffs: () => {
    return this.diffs.length
  },
  getEditors: () => {
    return {
      left: this.editors.left.ace,
      right: this.editors.right.ace,
      middle: this.editors.middle.ace
    }
  },
  diff: function () {
    var dmp = new diff_match_patch()
    var val1 = this.editors.left.ace.getSession().getValue()
    var val2 = this.editors.right.ace.getSession().getValue()
    var val3 = this.editors.middle.ace.getSession().getValue()
    var diffLeft = dmp.diff_main(val3, val1)
    var diffRight = dmp.diff_main(val2, val3)
    dmp.diff_cleanupSemantic(diffLeft)
    dmp.diff_cleanupSemantic(diffRight)
    this.editors.left.lineLengths  = getLineLengths(this.editors.left)
    this.editors.right.lineLengths = getLineLengths(this.editors.right)
    this.editors.middle.lineLengths = getLineLengths(this.editors.middle)

    var diffsLeft = []
    var diffsRight = []
    var offset = {
      left: 0,
      right: 0
    }
    diffLeft.forEach((chunk) => {
      var chunkType = chunk[0]
      var text = chunk[1]

      if (text.length === 0) {
        return;
      }

      if (chunkType === C.DIFF_EQUAL) {
        offset.left += text.length;
        offset.right += text.length;
      } else if (chunkType === C.DIFF_DELETE) {
        diffsLeft.push(computeDiff(this, C.DIFF_DELETE, offset.left, offset.right, text));
        offset.right += text.length;

      } else if (chunkType === C.DIFF_INSERT) {
        diffsLeft.push(computeDiff(this, C.DIFF_INSERT, offset.left, offset.right, text));
        offset.left += text.length;
      }

    }, this)

    offset = {
      left: 0,
      right: 0
    }

    diffRight.forEach((chunk) => {
      var chunkType = chunk[0]
      var text = chunk[1]

      if (text.length === 0) {
        return;
      }

      if (chunkType === C.DIFF_EQUAL) {
        offset.left += text.length;
        offset.right += text.length;
      } else if (chunkType === C.DIFF_DELETE) {
        diffsRight.push(computeDiff(this, C.DIFF_DELETE, offset.left, offset.right, text));
        offset.right += text.length;

      } else if (chunkType === C.DIFF_INSERT) {
        diffsRight.push(computeDiff(this, C.DIFF_INSERT, offset.left, offset.right, text));
        offset.left += text.length;
      }

    }, this)

    this.diffsLeft = simplifyDiffs(this, diffsLeft)
    this.diffsRight = simplifyDiffs(this, diffsRight)

    if (this.diffsLeft.length > this.options.maxDiffs) {
      return;
    }
    if (this.diffsRight.length > this.options.maxDiffs) {
      return;
    }

    clearDiffs(this)
    decorate(this)

  },

  destroy: () => {
    // destroy the two editors
    var leftValue = this.editors.left.ace.getValue()
    this.editors.left.ace.destroy()
    var oldDiv = this.editors.left.ace.container
    var newDiv = oldDiv.cloneNode(false)
    newDiv.textContent = leftValue
    oldDiv.parentNode.replaceChild(newDiv, oldDiv)

    var rightValue = this.editors.right.ace.getValue()
    this.editors.right.ace.destroy()
    oldDiv = this.editors.right.ace.container
    newDiv = oldDiv.cloneNode(false)
    newDiv.textContent = rightValue
    oldDiv.parentNode.replaceChild(newDiv, oldDiv)

    var middleValue = this.editors.middle.ace.getValue()
    this.editors.middle.ace.destroy()
    oldDiv = this.editors.middle.ace.container
    newDiv = oldDiv.cloneNode(false)
    newDiv.textContent = middleValue
    oldDiv.parentNode.replaceChild(newDiv, oldDiv)

    if (this.options.classes.gutterLeftID)
      document.getElementById(this.options.classes.gutterLeftID).innerHTML = ''
    if (this.options.classes.gutterRightID)
      document.getElementById(this.options.classes.gutterRightID).innerHTML = ''
  }
}

var getMode = (acediff, editor) => {
  var mode = acediff.options.mode;
  // if (editor === C.EDITOR_LEFT && acediff.options.left.mode !== null) {
  //   mode = acediff.options.left.mode;
  // }
  // if (editor === C.EDITOR_RIGHT && acediff.options.right.mode !== null) {
  //   mode = acediff.options.right.mode;
  // }
  // if (editor === C.EDITOR_MIDDLE && acediff.options.middle.mode !== null) {
  //   mode = acediff.options.middle.mode;
  // }
  return mode;
}

var getTheme = (acediff, editor) => {
  var theme = acediff.options.theme;
  if (editor === C.EDITOR_LEFT && acediff.options.left.theme !== null) {
    theme = acediff.options.left.theme;
  }
  if (editor === C.EDITOR_RIGHT && acediff.options.right.theme !== null) {
    theme = acediff.options.right.theme;
  }
  if (editor === C.EDITOR_MIDDLE && acediff.options.middle.theme !== null) {
    theme = acediff.options.middle.theme;
  }
  return theme;
}

var addEventHandlers = (acediff) => {
  var leftLastScrollTime = new Date().getTime(),
      rightLastScrollTime = new Date().getTime(),
      middleLastScrollTime = new Date().getTime(),
      now;

  acediff.editors.left.ace.getSession().on('changeScrollTop', (scroll) => {
    now = new Date().getTime();
    if (middleLastScrollTime + 50 < now) {
      updateGap(acediff, 'left', scroll);
    }
  });

  acediff.editors.right.ace.getSession().on('changeScrollTop', (scroll) => {
    now = new Date().getTime();
    if (middleLastScrollTime + 50 < now) {
      updateGap(acediff, 'right', scroll);
    }
  });

  acediff.editors.middle.ace.getSession().on('changeScrollTop', (scroll) => {
    now = new Date().getTime();
    if (leftLastScrollTime + 50 < now) {
      updateGap(acediff, 'left', scroll);
    }
    if (rightLastScrollTime + 50 < now) {
      updateGap(acediff, 'right', scroll);
    }
  });

  var diff = acediff.diff.bind(acediff);
  acediff.editors.left.ace.on('change', diff);
  acediff.editors.right.ace.on('change', diff);
  acediff.editors.middle.ace.on('change', diff);

  if (acediff.options.left.copyLinkEnabled) {
    on('#' + acediff.options.classes.gutterLeftID, 'click', '.' + acediff.options.classes.newCodeConnectorLink, (e) => {
      copy(acediff, e, C.LTR);
    });
  }
  if (acediff.options.right.copyLinkEnabled) {
    on('#' + acediff.options.classes.gutterRightID, 'click', '.' + acediff.options.classes.deletedCodeConnectorLink, (e) => {
      copy(acediff, e, C.RTL);
    });
  }

  var onResize = _.debounce(() => {
    var leftEl = document.getElementById(acediff.options.left.id)
    if (leftEl) {
      acediff.editors.availableHeight = leftEl.offsetHeight;

      // TODO this should re-init gutter
      acediff.diff();
    }
  }, 250);

  window.addEventListener('resize', onResize);
}

var copy = (acediff, e, dir) => {
  var diffIndex = parseInt(e.target.getAttribute('data-diff-index'), 10);
  var diff;
  var sourceEditor, targetEditor;

  var startLine, endLine, targetStartLine, targetEndLine;
  if (dir === C.LTR) {
    diff = acediff.diffsLeft[diffIndex];
    sourceEditor = acediff.editors.left;
    targetEditor = acediff.editors.middle;
    startLine = diff.leftStartLine;
    endLine = diff.leftEndLine;
    targetStartLine = diff.rightStartLine;
    targetEndLine = diff.rightEndLine;
  } else {
    diff = acediff.diffsRight[diffIndex];
    sourceEditor = acediff.editors.right;
    targetEditor = acediff.editors.middle;
    startLine = diff.rightStartLine;
    endLine = diff.rightEndLine;
    targetStartLine = diff.leftStartLine;
    targetEndLine = diff.leftEndLine;
  }

  var contentToInsert = '';
  for (var i = startLine; i < endLine; i++) {
    contentToInsert += getLine(sourceEditor, i) + '\n';
  }

  var startContent = '';
  for (var i = 0; i < targetStartLine; i++) {
    startContent += getLine(targetEditor, i) + '\n';
  }

  var endContent = '';
  var totalLines = targetEditor.ace.getSession().getLength();
  for (var i = targetEndLine; i < totalLines; i++) {
    endContent += getLine(targetEditor, i);
    if (i < totalLines - 1) {
      endContent += '\n';
    }
  }

  endContent = endContent.replace(/\s*$/, '');

  // keep track of the scroll height
  var h = targetEditor.ace.getSession().getScrollTop();
  targetEditor.ace.getSession().setValue(startContent + contentToInsert + endContent);
  targetEditor.ace.getSession().setScrollTop(parseInt(h));

  acediff.diff();
}

var getLineLengths = (editor) => {
  var lines = editor.ace.getSession().doc.getAllLines();
  var lineLengths = [];
  lines.forEach(function (line) {
    lineLengths.push(line.length + 1); // +1 for the newline char
  });
  return lineLengths;
}

// shows a diff in one of the two editors.
var showDiff = function (acediff, editor, startLine, endLine, className) {
  var editor = acediff.editors[editor];

  if (endLine < startLine) { // can this occur? Just in case.
    endLine = startLine;
  }

  var classNames = className + ' ' + ((endLine > startLine) ? 'lines' : 'targetOnly');
  endLine--; // because endLine is always + 1

  var lines = editor.ace.getSession().doc.getAllLines().length;
  if ((endLine + 1) == startLine && endLine == (lines - 1)){
    classNames += ' bottomLine'
  }

  // to get Ace to highlight the full row we just set the start and end chars to 0 and 1
  editor.markers.push(editor.ace.session.addMarker(new Range(startLine, 0, endLine, 1), classNames, 'fullLine'));
}

var updateGap = function (acediff, editor, scroll) {
  clearDiffs(acediff);
  decorate(acediff);
  // reposition the copy containers containing all the arrows
  positionCopyContainers(acediff);
}

var clearDiffs = (acediff) => {
  acediff.editors.left.markers.forEach(function (marker) {
    this.editors.left.ace.getSession().removeMarker(marker);
  }, acediff);
  acediff.editors.right.markers.forEach(function (marker) {
    this.editors.right.ace.getSession().removeMarker(marker);
  }, acediff);
  acediff.editors.middle.markers.forEach(function (marker) {
    this.editors.middle.ace.getSession().removeMarker(marker);
  }, acediff);
}

var addConnector = function (acediff, gutterSVG, editorLeft, editorRight, leftStartLine, leftEndLine, rightStartLine, rightEndLine) {
  var leftScrollTop = editorLeft.ace.getSession().getScrollTop();
  var rightScrollTop = editorRight.ace.getSession().getScrollTop();

  // All connectors, regardless of ltr or rtl have the same point system, even if p1 === p3 or p2 === p4
  //  p1   p2
  //
  //  p3   p4

  acediff.connectorYOffset = 1;

  var p1_x = -1;
  var p1_y = (leftStartLine * acediff.lineHeight) - leftScrollTop + 0.5;
  var p2_x = acediff.gutterWidth + 1;
  var p2_y = rightStartLine * acediff.lineHeight - rightScrollTop + 0.5;
  var p3_x = -1;
  var p3_y = (leftEndLine * acediff.lineHeight) - leftScrollTop + acediff.connectorYOffset + 0.5;
  var p4_x = acediff.gutterWidth + 1;
  var p4_y = (rightEndLine * acediff.lineHeight) - rightScrollTop + acediff.connectorYOffset + 0.5;
  var curve1 = getCurve(p1_x, p1_y, p2_x, p2_y);
  var curve2 = getCurve(p4_x, p4_y, p3_x, p3_y);

  var verticalLine1 = 'L' + p2_x + ',' + p2_y + ' ' + p4_x + ',' + p4_y;
  var verticalLine2 = 'L' + p3_x + ',' + p3_y + ' ' + p1_x + ',' + p1_y;
  var d = curve1 + ' ' + verticalLine1 + ' ' + curve2 + ' ' + verticalLine2;

  var el = document.createElementNS(C.SVG_NS, 'path');
  el.setAttribute('d', d);
  el.setAttribute('class', acediff.options.classes.connector);
  gutterSVG.appendChild(el);
}

var addCopyArrows = (acediff, info, diffIndex) => {
  if (info.leftEndLine > info.leftStartLine && acediff.options.left.copyLinkEnabled) {
    var arrow = createArrow({
      className: acediff.options.classes.newCodeConnectorLink,
      topOffset: info.leftStartLine * acediff.lineHeight,
      tooltip: 'Copy to right',
      diffIndex: diffIndex,
      arrowContent: acediff.options.classes.newCodeConnectorLinkContent
    });
    acediff.copyRightContainer.appendChild(arrow);
  }

  if (info.rightEndLine > info.rightStartLine && acediff.options.right.copyLinkEnabled) {
    var arrow = createArrow({
      className: acediff.options.classes.deletedCodeConnectorLink,
      topOffset: info.rightStartLine * acediff.lineHeight,
      tooltip: 'Copy to left',
      diffIndex: diffIndex,
      arrowContent: acediff.options.classes.deletedCodeConnectorLinkContent
    });
    acediff.copyLeftContainer.appendChild(arrow);
  }
}

var positionCopyContainers = (acediff) => {
  var leftTopOffset = acediff.editors.left.ace.getSession().getScrollTop();
  var rightTopOffset = acediff.editors.right.ace.getSession().getScrollTop();

  acediff.copyRightContainer.style.cssText = 'top: ' + (-leftTopOffset) + 'px';
  acediff.copyLeftContainer.style.cssText = 'top: ' + (-rightTopOffset) + 'px';
}

/**
 * This method takes the raw diffing info from the Google lib and returns a nice clean object of the following
 * form:
 * {
 *   leftStartLine:
 *   leftEndLine:
 *   rightStartLine:
 *   rightEndLine:
 * }
 *
 * Ultimately, that's all the info we need to highlight the appropriate lines in the left + right editor, add the
 * SVG connectors, and include the appropriate <<, >> arrows.
 *
 * Note: leftEndLine and rightEndLine are always the start of the NEXT line, so for a single line diff, there will
 * be 1 separating the startLine and endLine values. So if leftStartLine === leftEndLine or rightStartLine ===
 * rightEndLine, it means that new content from the other editor is being inserted and a single 1px line will be
 * drawn.
 */
var computeDiff = (acediff, diffType, offsetLeft, offsetRight, diffText) => {
  var lineInfo = {};

  // this was added in to hack around an oddity with the Google lib. Sometimes it would include a newline
  // as the first char for a diff, other times not - and it would change when you were typing on-the-fly. This
  // is used to level things out so the diffs don't appear to shift around
  var newContentStartsWithNewline = /^\n/.test(diffText);

  if (diffType === C.DIFF_INSERT) {

    // pretty confident this returns the right stuff for the left editor: start & end line & char
    var info = getSingleDiffInfo(acediff.editors.left, offsetLeft, diffText);

    // this is the ACTUAL undoctored current line in the other editor. It's always right. Doesn't mean it's
    // going to be used as the start line for the diff though.
    var currentLineOtherEditor = getLineForCharPosition(acediff.editors.right, offsetRight);
    var numCharsOnLineOtherEditor = getCharsOnLine(acediff.editors.right, currentLineOtherEditor);
    var numCharsOnLeftEditorStartLine = getCharsOnLine(acediff.editors.left, info.startLine);
    var numCharsOnLine = getCharsOnLine(acediff.editors.left, info.startLine);

    // this is necessary because if a new diff starts on the FIRST char of the left editor, the diff can comes
    // back from google as being on the last char of the previous line so we need to bump it up one
    var rightStartLine = currentLineOtherEditor;
    if (numCharsOnLine === 0 && newContentStartsWithNewline) {
      newContentStartsWithNewline = false;
    }
    if (info.startChar === 0 && isLastChar(acediff.editors.right, offsetRight, newContentStartsWithNewline)) {
      rightStartLine = currentLineOtherEditor + 1;
    }

    var sameLineInsert = info.startLine === info.endLine;

    // whether or not this diff is a plain INSERT into the other editor, or overwrites a line take a little work to
    // figure out. This feels like the hardest part of the entire script.
    var numRows = 0;
    if (

      // dense, but this accommodates two scenarios:
      // 1. where a completely fresh new line is being inserted in left editor, we want the line on right to stay a 1px line
      // 2. where a new character is inserted at the start of a newline on the left but the line contains other stuff,
      //    we DO want to make it a full line
      (info.startChar > 0 || (sameLineInsert && diffText.length < numCharsOnLeftEditorStartLine)) &&

      // if the right editor line was empty, it's ALWAYS a single line insert [not an OR above?]
      numCharsOnLineOtherEditor > 0 &&

      // if the text being inserted starts mid-line
      (info.startChar < numCharsOnLeftEditorStartLine)) {
      numRows++;
    }

    lineInfo = {
      leftStartLine: info.startLine,
      leftEndLine: info.endLine + 1,
      rightStartLine: rightStartLine,
      rightEndLine: rightStartLine + numRows
    };

  } else {
    var info = getSingleDiffInfo(acediff.editors.right, offsetRight, diffText);

    var currentLineOtherEditor = getLineForCharPosition(acediff.editors.left, offsetLeft);
    var numCharsOnLineOtherEditor = getCharsOnLine(acediff.editors.left, currentLineOtherEditor);
    var numCharsOnRightEditorStartLine = getCharsOnLine(acediff.editors.right, info.startLine);
    var numCharsOnLine = getCharsOnLine(acediff.editors.right, info.startLine);

    // this is necessary because if a new diff starts on the FIRST char of the left editor, the diff can comes
    // back from google as being on the last char of the previous line so we need to bump it up one
    var leftStartLine = currentLineOtherEditor;
    if (numCharsOnLine === 0 && newContentStartsWithNewline) {
      newContentStartsWithNewline = false;
    }
    if (info.startChar === 0 && isLastChar(acediff.editors.left, offsetLeft, newContentStartsWithNewline)) {
      leftStartLine = currentLineOtherEditor + 1;
    }

    var sameLineInsert = info.startLine === info.endLine;
    var numRows = 0;
    if (

      // dense, but this accommodates two scenarios:
      // 1. where a completely fresh new line is being inserted in left editor, we want the line on right to stay a 1px line
      // 2. where a new character is inserted at the start of a newline on the left but the line contains other stuff,
      //    we DO want to make it a full line
      (info.startChar > 0 || (sameLineInsert && diffText.length < numCharsOnRightEditorStartLine)) &&

      // if the right editor line was empty, it's ALWAYS a single line insert [not an OR above?]
      numCharsOnLineOtherEditor > 0 &&

      // if the text being inserted starts mid-line
      (info.startChar < numCharsOnRightEditorStartLine)) {
      numRows++;
    }

    lineInfo = {
      leftStartLine: leftStartLine,
      leftEndLine: leftStartLine + numRows,
      rightStartLine: info.startLine,
      rightEndLine: info.endLine + 1
    };
  }

  return lineInfo;
}

// helper to return the startline, endline, startChar and endChar for a diff in a particular editor. Pretty
// fussy function
var getSingleDiffInfo = (editor, offset, diffString) => {
  var info = {
    startLine: 0,
    startChar: 0,
    endLine: 0,
    endChar: 0
  };
  var endCharNum = offset + diffString.length;
  var runningTotal = 0;
  var startLineSet = false,
    endLineSet = false;

  editor.lineLengths.forEach(function (lineLength, lineIndex) {
    runningTotal += lineLength;

    if (!startLineSet && offset < runningTotal) {
      info.startLine = lineIndex;
      info.startChar = offset - runningTotal + lineLength;
      startLineSet = true;
    }

    if (!endLineSet && endCharNum <= runningTotal) {
      info.endLine = lineIndex;
      info.endChar = endCharNum - runningTotal + lineLength;
      endLineSet = true;
    }
  });

  // if the start char is the final char on the line, it's a newline & we ignore it
  if (info.startChar > 0 && getCharsOnLine(editor, info.startLine) === info.startChar) {
    info.startLine++;
    info.startChar = 0;
  }

  // if the end char is the first char on the line, we don't want to highlight that extra line
  if (info.endChar === 0) {
    info.endLine--;
  }

  var endsWithNewline = /\n$/.test(diffString);
  if (info.startChar > 0 && endsWithNewline) {
    info.endLine++;
  }

  return info;
}

var getCharsOnLine = (editor, line) => {
  return getLine(editor, line).length;
}

var getLine = (editor, line) => {
  return editor.ace.getSession().doc.getLine(line);
}

var getLineForCharPosition = (editor, offsetChars) => {
  var lines = editor.ace.getSession().doc.getAllLines(),
    foundLine = 0,
    runningTotal = 0;

  for (var i = 0; i < lines.length; i++) {
    runningTotal += lines[i].length + 1; // +1 needed for newline char
    if (offsetChars <= runningTotal) {
      foundLine = i;
      break;
    }
  }
  return foundLine;
}

var isLastChar = (editor, char, startsWithNewline) => {
  var lines = editor.ace.getSession().doc.getAllLines(),
    runningTotal = 0,
    isLastChar = false;

  for (var i = 0; i < lines.length; i++) {
    runningTotal += lines[i].length + 1; // +1 needed for newline char
    var comparison = runningTotal;
    if (startsWithNewline) {
      comparison--;
    }

    if (char === comparison) {
      isLastChar = true;
      break;
    }
  }
  return isLastChar;
}

var createArrow = (info) => {
  var el = document.createElement('div');
  var props = {
    'class': info.className,
    'style': 'top:' + info.topOffset + 'px',
    title: info.tooltip,
    'data-diff-index': info.diffIndex
  };
  for (var key in props) {
    el.setAttribute(key, props[key]);
  }
  el.innerHTML = info.arrowContent;
  return el;
}

var createGutter = (acediff) => {
  acediff.gutterHeight = document.getElementById(acediff.options.classes.gutterLeftID).clientHeight;
  acediff.gutterWidth = document.getElementById(acediff.options.classes.gutterLeftID).clientWidth;

  var leftHeight = getTotalHeight(acediff, C.EDITOR_LEFT);
  var rightHeight = getTotalHeight(acediff, C.EDITOR_MIDDLE);
  var height = Math.max(leftHeight, rightHeight, acediff.gutterHeight);

  acediff.gutterLeftSVG = document.createElementNS(C.SVG_NS, 'svg');
  acediff.gutterLeftSVG.setAttribute('width', acediff.gutterWidth);
  acediff.gutterLeftSVG.setAttribute('height', height);

  document.getElementById(acediff.options.classes.gutterLeftID).appendChild(acediff.gutterLeftSVG);

  acediff.gutterHeight = document.getElementById(acediff.options.classes.gutterRightID).clientHeight;
  acediff.gutterWidth = document.getElementById(acediff.options.classes.gutterRightID).clientWidth;

  var leftHeight = getTotalHeight(acediff, C.EDITOR_MIDDLE);
  var rightHeight = getTotalHeight(acediff, C.EDITOR_RIGHT);
  var height = Math.max(leftHeight, rightHeight, acediff.gutterHeight);

  acediff.gutterRightSVG = document.createElementNS(C.SVG_NS, 'svg');
  acediff.gutterRightSVG.setAttribute('width', acediff.gutterWidth);
  acediff.gutterRightSVG.setAttribute('height', height);

  document.getElementById(acediff.options.classes.gutterRightID).appendChild(acediff.gutterRightSVG);
}

// acediff.editors.left.ace.getSession().getLength() * acediff.lineHeight
var getTotalHeight = (acediff, editor) => {
  var ed = (editor === C.EDITOR_LEFT) ? acediff.editors.left : acediff.editors.right;
  return ed.ace.getSession().getLength() * acediff.lineHeight;
}

// creates two contains for positioning the copy left + copy right arrows
var createCopyContainers = (acediff) => {
  acediff.copyRightContainer = document.createElement('div');
  acediff.copyRightContainer.setAttribute('class', acediff.options.classes.copyRightContainer);
  acediff.copyLeftContainer = document.createElement('div');
  acediff.copyLeftContainer.setAttribute('class', acediff.options.classes.copyLeftContainer);

  document.getElementById(acediff.options.classes.gutterLeftID).appendChild(acediff.copyRightContainer);
  document.getElementById(acediff.options.classes.gutterRightID).appendChild(acediff.copyLeftContainer);
}

var clearGutter = (acediff) => {
  //gutter.innerHTML = '';

  var gutterLeftEl = document.getElementById(acediff.options.classes.gutterLeftID);
  var gutterRightEl = document.getElementById(acediff.options.classes.gutterRightID);
  try {
    gutterLeftEl.removeChild(acediff.gutterLeftSVG);
    gutterRightEl.removeChild(acediff.gutterRightSVG);
  } catch (e){}

  createGutter(acediff);
}


var clearArrows = (acediff) => {
  acediff.copyLeftContainer.innerHTML = '';
  acediff.copyRightContainer.innerHTML = '';
}

/*
  * This combines multiple rows where, say, line 1 => line 1, line 2 => line 2, line 3-4 => line 3. That could be
  * reduced to a single connector line 1=4 => line 1-3
  */
var simplifyDiffs = (acediff, diffs) => {
  var groupedDiffs = [];

  function compare(val) {
    return (acediff.options.diffGranularity === C.DIFF_GRANULARITY_SPECIFIC) ? val < 1 : val <= 1;
  }

  diffs.forEach(function (diff, index) {
    if (index === 0) {
      groupedDiffs.push(diff);
      return;
    }

    // loop through all grouped diffs. If this new diff lies between an existing one, we'll just add to it, rather
    // than create a new one
    var isGrouped = false;
    for (var i = 0; i < groupedDiffs.length; i++) {
      if (compare(Math.abs(diff.leftStartLine - groupedDiffs[i].leftEndLine)) &&
        compare(Math.abs(diff.rightStartLine - groupedDiffs[i].rightEndLine))) {

        // update the existing grouped diff to expand its horizons to include this new diff start + end lines
        groupedDiffs[i].leftStartLine = Math.min(diff.leftStartLine, groupedDiffs[i].leftStartLine);
        groupedDiffs[i].rightStartLine = Math.min(diff.rightStartLine, groupedDiffs[i].rightStartLine);
        groupedDiffs[i].leftEndLine = Math.max(diff.leftEndLine, groupedDiffs[i].leftEndLine);
        groupedDiffs[i].rightEndLine = Math.max(diff.rightEndLine, groupedDiffs[i].rightEndLine);
        isGrouped = true;
        break;
      }
    }

    if (!isGrouped) {
      groupedDiffs.push(diff);
    }
  });

  // clear out any single line diffs (i.e. single line on both editors)
  var fullDiffs = [];
  groupedDiffs.forEach(function (diff) {
    if (diff.leftStartLine === diff.leftEndLine && diff.rightStartLine === diff.rightEndLine) {
      return;
    }
    fullDiffs.push(diff);
  });

  return fullDiffs;
}

var decorate = function (acediff) {
  clearGutter(acediff);
  clearArrows(acediff);

  acediff.diffsLeft.forEach(function (info, diffIndex) {
    if (this.options.showDiffs) {
      showDiff(this, C.EDITOR_LEFT, info.leftStartLine, info.leftEndLine, this.options.classes.diff);
      showDiff(this, C.EDITOR_MIDDLE, info.rightStartLine, info.rightEndLine, this.options.classes.diff);

      if (this.options.showConnectors) {
        addConnector(this, this.gutterLeftSVG, this.editors.left, this.editors.middle, info.leftStartLine, info.leftEndLine, info.rightStartLine, info.rightEndLine);
      }
      addCopyArrows(this, info, diffIndex);
    }
  }, acediff);

  acediff.diffsRight.forEach(function (info, diffIndex) {
    if (this.options.showDiffs) {
      showDiff(this, C.EDITOR_MIDDLE, info.leftStartLine, info.leftEndLine, this.options.classes.diff);
      showDiff(this, C.EDITOR_RIGHT, info.rightStartLine, info.rightEndLine, this.options.classes.diff);

      if (this.options.showConnectors) {
        addConnector(this, this.gutterRightSVG, this.editors.middle, this.editors.right, info.leftStartLine, info.leftEndLine, info.rightStartLine, info.rightEndLine);
      }
      addCopyArrows(this, info, diffIndex);
    }
  }, acediff);
}

var getScrollingInfo = (acediff, dir) => {
  if (dir == C.EDITOR_LEFT) {
    acediff.editors.left.ace.getSession().getScrollTop()
  } else if ( dir == C.EDITOR_MIDDLE ) {
    acediff.editors.middle.ace.getSession().getScrollTop()
  } else {
    acediff.editors.right.ace.getSession().getScrollTop()
  }
  // return (dir == C.EDITOR_LEFT) ? acediff.editors.left.ace.getSession().getScrollTop() : acediff.editors.right.ace.getSession().getScrollTop();
}

var getEditorHeight = (acediff) => {
  //editorHeight: document.getElementById(acediff.options.left.id).clientHeight
  return document.getElementById(acediff.options.left.id).offsetHeight;
}

// generates a Bezier curve in SVG format
var getCurve = (startX, startY, endX, endY) => {
  var w = endX - startX;
  var halfWidth = startX + (w / 2);

  // position it at the initial x,y coords
  var curve = 'M ' + startX + ' ' + startY +

    // now create the curve. This is of the form "C M,N O,P Q,R" where C is a directive for SVG ("curveto"),
    // M,N are the first curve control point, O,P the second control point and Q,R are the final coords
    ' C ' + halfWidth + ',' + startY + ' ' + halfWidth + ',' + endY + ' ' + endX + ',' + endY;

  return curve;
}

var on = (elSelector, eventName, selector, fn) => {
  var element = (elSelector === 'document') ? document : document.querySelector(elSelector);

  element.addEventListener(eventName, function (event) {
    var possibleTargets = element.querySelectorAll(selector);
    var target = event.target;

    for (var i = 0, l = possibleTargets.length; i < l; i++) {
      var el = target;
      var p = possibleTargets[i];

      while (el && el !== element) {
        if (el === p) {
          return fn.call(p, event);
        }
        el = el.parentNode;
      }
    }
  });
}

export default AceMerge;
