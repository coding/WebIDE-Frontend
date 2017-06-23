import { inject, observer } from 'mobx-react'
import StatusBar from './StatusBar'
import state from './state'

export default inject(() => ({ messages: state.messages.values() }))(StatusBar)
