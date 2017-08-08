import React from 'react'
import PluginArea from 'components/Plugins/component'
import { TOPBAR } from 'components/Plugins/constants'
import { observer } from 'mobx-react'
import Breadcrumbs from './Breadcrumbs'

const TopBar = observer(() => (
  <div className='top-bar'>
    <Breadcrumbs />
    <PluginArea className='widget' position={TOPBAR.WIDGET} />
  </div>
  ))

export default TopBar
