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

const closeFileTab = async (e, tab, removeTab) => {
  e.stopPropagation()
  if (tab.tabGroupId === 'terminalGroup') {
    removeTab(tab.id)
    return
  }
  const isMonaco = !config.switchOldEditor
  const editor = isMonaco ? tab.editorInfo.monacoEditor : tab.editor.cm
  const content = (editor && editor.getValue) ? editor.getValue() : ''

  if (!tab.file && content && tab.editorInfo.uri.includes('inmemory') ) {
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

let TabLabel = observer(({ tab, removeTab, activateTab, openContextMenu, dbClickHandler }) => {
  console.log(tab.title)
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
      {tab.icon && <div className={`icon ${tab.icon}`} />}
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
