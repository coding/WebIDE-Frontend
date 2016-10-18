/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import config from '../../config'

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
  if (state.TabState.getActiveGroup() && state.TabState.getActiveGroup().activeTab) {
    return {currentPath: state.TabState.getActiveGroup().activeTab.path || ''}
  } else {
    return {currentPath: ''}
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
