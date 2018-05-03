import React from 'react'
import { observer } from 'mobx-react'
import MenuBar from './MenuBar'
import menuBarItems from './menuBarItems'
import state from './state'

const MenuBarContainer = observer(() => <MenuBar items={state.items} />)

export default MenuBarContainer
export { menuBarItems }
