import React from 'react'
import { observer, inject } from 'mobx-react'
import config from 'config'

let Breadcrumbs = observer(({ fileNode }) => {
  const pathComps = fileNode.path.split('/')
  const rootCrumb = {path: '/', name: config.projectName, isDir: true}
  const crumbs = pathComps.map(( pathComp, idx, pathComps ) => {
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
})

Breadcrumbs = inject(state => {
  const activeTab = state.EditorTabState.activeTab
  const currentPath = activeTab && activeTab.file ? activeTab.file.path : ''
  let fileNode = state.FileTreeState.entities.get(currentPath)
  if (!fileNode) fileNode = state.FileTreeState.root // fallback to rootNode
  return { fileNode }
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
      {SHOW_ICON ? <i className={node.isDir ? 'fa fa-folder-o' : 'fa fa-file-text-o'} style={{marginRight:'5px'}}></i>:null}
      <div className={fileClassName}>{node.name}</div>
      <div className='crumb-node-name'>{extension`siderBar${props}`}</div>
    </div>
  )
}

export default Breadcrumbs
