/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import config from '../../config'
import * as Tab from '../Tab'

let Breadcrumbs = ({currentPath, fileNode}) => {
  const pathComps = currentPath.split('/')
  const rootCrumb = {path: '/', name: config.projectName, isDir: true}
  const crumbs = pathComps.map((pathComp, idx, pathComps) => {
    if (pathComp === '') return rootCrumb
    return {
      name: pathComp,
      path: pathComps.slice(0, idx+1).join('/'),
      gitStatus: fileNode.gitStatus,
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
  let currentPath = ''
  let fileNode
  if (activeTab) {
    currentPath = activeTab.path || ''
  }
  if (currentPath != '') {
    fileNode = state.FileTreeState.findNodeByPath(currentPath)
  }
  return { currentPath, fileNode }
})(Breadcrumbs)

const SHOW_ICON = true
const Crumb = ({node}) => {
  const props = { name: node.name }
  let fileClassName = 'crumb-node-name'
  if (!node.isDir) {
    fileClassName = `crumb-node-name git-${node.gitStatus ? node.gitStatus.toLowerCase() : 'none'}`
  }
  return (
    <div className='crumb'>
      {SHOW_ICON ? <i className={node.isDir ? 'fa fa-folder-o' : 'fa fa-file-o'} style={{marginRight:'5px'}}></i>:null}
      <div className={fileClassName}>{node.name}</div>
      <div className='crumb-node-name'>{extension`siderBar${props}`}</div>
    </div>
  )
}

export default Breadcrumbs
