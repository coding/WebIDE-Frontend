import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { dnd } from 'utils'
import { defaultProps } from 'utils/decorators'
import { dispatch } from '../../store'
import * as Modal from '../../components/Modal/actions'
import config from 'config'
import dispatchCommand from 'commands/dispatchCommand'
import { fileIconProviders } from 'components/FileTree/state'

const closeFileTab = async (e, tab, removeTab) => {
  e.stopPropagation()
  if (tab.tabGroupId === 'terminalGroup') {
    removeTab(tab.id)
    return
  }
  const editor = tab.editorInfo.monacoEditor
  const content = (editor && editor.getValue) ? editor.getValue() : ''

  if (!tab.file && content && tab.editorInfo.uri.includes('inmemory')) {
    const confirmed = await Modal.showModal('Confirm', {
      header: i18n`file.saveNew`,
      message: i18n`file.newInfo`,
    })
    if (confirmed) {
      Modal.dismissModal()
      dispatchCommand('file:save')
    } else {
      Modal.dismissModal()
      removeTab(tab.id)
    }
  } else {
    removeTab(tab.id)
  }
}

const TabIcon = observer(({ fileName, defaultIconStr }) => {
  const provider = fileIconProviders.get(config.fileicons)
  if (provider) {
    let fileIconsProvider = provider
    if (typeof provider === 'function') {
      fileIconsProvider = provider()
    }
    const { icons: allicons, fileicons: fileiconsMap } = fileIconsProvider
    let fileiconName = fileiconsMap.defaultIcon
    const extension = fileName.split('.').pop()
    for (let i = 0; i < fileiconsMap.icons.length; i += 1) {
      const fileicon = fileiconsMap.icons[i]
      if ((fileicon.fileNames && fileicon.fileNames.includes(fileName)) || (fileicon.fileExtensions && fileicon.fileExtensions.includes(extension))) {
        fileiconName = fileicon.name
        break
      }
    }
    return (
      <span
        className='filetree-node-icon'
        style={{
          backgroundImage: `url(${allicons[fileiconName] || allicons[fileiconsMap.defaultIcon]})`,
          width: 15,
          height: 15
        }}
      />
    )
  }
  return <div className={`icon ${defaultIconStr}`} />
})

let TabLabel = observer(({ tab, removeTab, activateTab, openContextMenu, dbClickHandler }) => {
  const tabLabelId = `tab_label_${tab.id}`
  return (
    <li className={cx('tab-label', {
      active: tab.isActive,
      modified: tab.flags.modified
    })}
      title={tab.editorProps && tab.editorProps.filePath}
      id={tabLabelId}
      data-droppable='TABLABEL'
      draggable='true'
      onClick={e => activateTab(tab.id)}
      onMouseUp={e => { e.button === 1 && removeTab(tab.id) }}
      onDoubleClick={() => {
        if (!tab.isActive) {
          activateTab(tab.id)
        }
        dbClickHandler()
      }}
      onDragStart={e => {
        // Chrome 下直接执行 dragStart 会导致立即又出发了 window.dragend, 添加 timeout 以避免无法拖动的情况
        setTimeout(() => dnd.dragStart({ type: 'TAB', id: tab.id }), 0)
      }}
      onContextMenu={e => openContextMenu(e, tab)}
    >
      {dnd.target.id === tabLabelId ? <div className='tab-label-insert-pos'></div> : null}
      <TabIcon fileName={tab.title} defaultIconStr={tab.icon} />
      <div className='title'>{tab.title}</div>
      <div className='control'>
        <i className='close' onClick={e => closeFileTab(e, tab, removeTab)}>×</i>
        <i className='dot'></i>
      </div>
    </li>
  )
})

TabLabel.propTypes = {
  tab: PropTypes.object.isRequired,
  removeTab: PropTypes.func.isRequired,
  activateTab: PropTypes.func.isRequired,
  openContextMenu: PropTypes.func.isRequired,
  dbClickHandler: PropTypes.func.isRequired,
}

TabLabel = defaultProps(props => ({
  activateTab: function () {
    props.tab.activate()
  },
  removeTab: function () {
    props.tab.destroy()
  },
}))(TabLabel)

export default TabLabel
