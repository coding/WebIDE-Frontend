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

const Crumb = ({node}) => {
  return (
    <div className='crumb'>
      <div className='crumb-node-name'>{node.name}</div>
    </div>
  )
}

export default Breadcrumbs
