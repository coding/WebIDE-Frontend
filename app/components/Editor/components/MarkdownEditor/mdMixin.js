import state from './state'
// import findByTextContent from './utils'
import marked from 'marked'
import animatedScrollTo from 'animated-scrollto'

export default {
  key: 'md_mixin',
  getEventListeners () {
    return {
      scroll: (cm) => {
        const { editor } = this.props
        const { top, clientHeight } = cm.getScrollInfo()
        const topLine = Math.round(top / cm.defaultTextHeight()) + 1
        const scrollMap = editor.scrollMap
        const posTo = scrollMap[topLine - 1]
        if (posTo && editor.previewDOM) {
          animatedScrollTo(editor.previewDOM.parentElement, posTo, 500)
        }
      },
    }
  },
  componentWillMount () {},
  componentDidMount () {},
}
