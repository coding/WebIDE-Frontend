import React from 'react'
import { observer, inject } from 'mobx-react'
import Breadcrumbs from './Breadcrumbs'
import PluginArea from 'components/Plugins/component'

const TopBar = observer(() => {
  return (
    <div className='top-bar'>
      <Breadcrumbs />
      <PluginArea className='widget' position='TopBar.Widget' />
    </div>
  )
})

export default TopBar
