import state from './state'
import uniqueId from 'lodash/uniqueId'
import debounce from 'lodash/debounce'

export default {
  key: 'java_mixin',
  getEventListeners () {
    return {
      change: debounce((cm) => {
        state.previewUniqueId = uniqueId()
      }, 200),
    }
  },
  componentWillMount () {},
  componentDidMount () {},
}
