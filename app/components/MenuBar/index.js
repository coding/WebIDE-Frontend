import { observer } from 'mobx-react'
import MenuBar from './MenuBar'
import state from './state'

const MenuBarContainer = observer((() => <MenuBar items={state.items} />))

export default MenuBarContainer
