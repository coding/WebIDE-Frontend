import state from './state'
import debounce from 'lodash/debounce'

export default {
  key: 'java_mixin',
  getEventListeners () {
    return {
      change: debounce((cm) => {
      }, 1200),
    }
  },
  componentWillMount () {},
  componentDidMount () {},
}
