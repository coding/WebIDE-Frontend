import state from './state'
// import findByTextContent from './utils'
import marked from 'marked'
import animatedScrollTo from 'animated-scrollto'

const buildScrollMap = (previewDOM) => {
  const _scrollMap = {}
  const nonEmptyList = []
  nonEmptyList.push(0)
  _scrollMap[0] = 0
  _scrollMap.offsetHeight = previewDOM.offsetHeight
  const linesDOM = Array.from(previewDOM.getElementsByClassName('line'))
  const linesCount = linesDOM.length

  // for (let i = 0; i < linesCount; i++) { _scrollMap.push(-1) }
  linesDOM.forEach((lineDOM) => {
    const lineNum = lineDOM.dataset.line
    if (lineNum === '') return
    if (lineNum !== 0) { nonEmptyList.push(lineNum) }
    _scrollMap[lineNum] = Math.round(lineDOM.offsetTop) // + offset)
  })
  let pos = 0
  for (let i = 1; i < linesCount; i++) {
    if (_scrollMap[i] !== -1) {
      pos++
      continue
    }

    const a = nonEmptyList[pos]
    const b = nonEmptyList[pos + 1]
    _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a))
  }
  return _scrollMap
}

export default {
  key: 'md_mixin',
  getEventListeners () {
    return {
      scroll: (cm) => {
        const { editor } = this.props
        if (!editor.previewDOM) return
        const { top, clientHeight } = cm.getScrollInfo()
        
        const topLine = Math.round(top / cm.defaultTextHeight()) + 1
        if (!editor.scrollMap || editor.previewDOM.offsetHeight !== editor.scrollMap.offsetHeight) {
          editor.scrollMap = buildScrollMap(editor.previewDOM)
        }
        const posTo = editor.scrollMap[topLine - 1]
        if (posTo && posTo >= 0 && editor.previewDOM) {
          animatedScrollTo(editor.previewDOM.parentElement, posTo, 500)
        }
      },
    }
  },
  componentWillMount () {},
  componentDidMount () {},
}
