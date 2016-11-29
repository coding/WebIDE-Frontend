/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import config from '../../config'
import * as Tab from '../Tab'

let Breadcrumbs = ({currentPath}) => {
  const pathComps = currentPath.split('/')
  const rootCrumb = {path: '/', name: config.projectName, isDir: true}
  const crumbs = pathComps.map((pathComp, idx, pathComps) => {
    if (pathComp === '') return rootCrumb
    return {
      name: pathComp,
      path: pathComps.slice(0, idx+1).join('/'),
      isDir: (idx !== pathComps.length - 1)   // last pathComp isDir === false
    }
  }, [])

  return (
    <div className='breadcrumbs'>
      {crumbs.map(crumb => <Crumb node={crumb} key={crumb.path}/>)}
    </div>
  )
}
Breadcrumbs = connect(state => {
  const activeTab = Tab.selectors.getActiveTab(state.TabState)
  if (activeTab) {
    return { currentPath: activeTab.path || '' }
  } else {
    return { currentPath: '' }
  }
})(Breadcrumbs)

const SHOW_ICON = false
const Crumb = ({node}) => {
  return (
    <div className='crumb'>
      {SHOW_ICON?<i className={node.isDir ? 'fa fa-folder-o' : 'fa fa-file-o'} style={{marginRight:'5px'}}></i>:null}
      <div className='crumb-node-name'>{node.name}</div>
    </div>
  )
}

export default Breadcrumbs
