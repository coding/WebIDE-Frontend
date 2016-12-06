import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { dragStart } from '../DragAndDrop/actions';
import Menu from '../Menu'
import * as TabActions from './actions';
import * as PaneActions from '../Pane/actions';


class _TabBar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showDropdownMenu: false
    }
  }

  static propTypes = {
    tabGroupId: PropTypes.string,
    tabIds: PropTypes.object,
    isDraggedOver: PropTypes.bool,
    addTab: PropTypes.func,
    closePane: PropTypes.func,
    isRootPane: PropTypes.bool
  }

  makeDropdownMenuItems = () => {
    let baseItems = this.props.isRootPane ? []
      : [{
        name: 'Close Pane',
        command: this.props.closePane,
      }]
    const tabs = this.props.tabs
    const tabLabelsItem = tabs && tabs.map(tab => ({
      name: tab.title || 'untitled',
      command: e => this.props.activateTab(tab.id)
    })).toJS()

    if (tabLabelsItem.length) {
      return baseItems.concat({name: '-'}, tabLabelsItem)
    } else {
      return baseItems
    }
  }

  renderDropdownMenu () {
    const dropdownMenuItems = this.makeDropdownMenuItems()
    if (this.state.showDropdownMenu && dropdownMenuItems.length) {
      return <Menu className='top-down to-left'
        items={dropdownMenuItems}
        style={{right: '2px'}}
        deactivate={e=>this.setState({showDropdownMenu: false})}
      />
    } else {
      return null
    }
  }

  render () {
    const { tabIds, tabGroupId, isRootPane, addTab, closePane, isDraggedOver } = this.props
    return (
      <div className='tab-bar' id={`tab_bar_${tabGroupId}`} data-droppable='TABBAR'>
        <ul className='tab-labels'>
          { tabIds && tabIds.map(tabId =>
            <TabLabel tabId={tabId} key={tabId} />
          ) }
        </ul>
        {isDraggedOver ? <div className='tab-label-insert-pos'></div>: null}
        <div className='tab-add-btn' onClick={addTab} >＋</div>
        <div className='tab-show-list'
          style={{position: 'relative'}}
          onClick={e=>{e.stopPropagation();this.setState({showDropdownMenu: true})}}
        >
          <i className='fa fa-sort-desc'/>
          {this.renderDropdownMenu()}
        </div>

      </div>
    )
  }
}

const TabBar = connect((state, { tabIds, tabGroupId, containingPaneId }) => ({
  tabs: tabIds.map(tabId => state.TabState.tabs.get(tabId)),
  isDraggedOver: state.DragAndDrop.meta
    ? state.DragAndDrop.meta.tabBarTargetId === `tab_bar_${tabGroupId}`
    : false,
  isRootPane: state.PaneState.rootPaneId === containingPaneId
}), (dispatch, { tabGroupId, containingPaneId }) => ({
  activateTab: (tabId) => dispatch(TabActions.activateTab(tabId)),
  addTab: () => dispatch(TabActions.createTabInGroup(tabGroupId)),
  closePane: () => dispatch(PaneActions.closePane(containingPaneId))
})
)(_TabBar)


const _TabLabel = ({tab, isDraggedOver, removeTab, activateTab, dragStart}) => {
  const possibleStatus = {
    'modified': '*',
    'warning': '!',
    'offline': '*',
    'sync': '[-]',
    'loading': <i className='fa fa-spinner fa-spin' />
  }

  return (
    <li className={cx('tab-label', {
      active: tab.isActive,
      modified: tab.flags.modified
    })}
      id={`tab_label_${tab.id}`}
      data-droppable='TABLABEL'
      onClick={e => activateTab(tab.id)}
      draggable='true'
      onDragStart={e => dragStart({sourceType: 'TAB', sourceId: tab.id})}
    >
      {isDraggedOver ? <div className='tab-label-insert-pos'></div>: null}
      <div className='title'>{tab.title}</div>
      <div className='control'>
        <i className='close' onClick={e => { e.stopPropagation(); removeTab(tab.id) }}>×</i>
        <i className='dot'></i>
      </div>
    </li>
  )
}

_TabLabel.propTypes = {
  tab: PropTypes.object,
  isDraggedOver: PropTypes.bool,
  removeTab: PropTypes.func,
  activateTab: PropTypes.func,
  dragStart: PropTypes.func,
}

const TabLabel = connect((state, { tabId }) => ({
  isDraggedOver: state.DragAndDrop.meta
    ? state.DragAndDrop.meta.tabLabelTargetId === `tab_label_${tabId}`
    : false,
  tab: state.TabState.tabs.get(tabId),
}), dispatch => ({
  removeTab: (tabId) => dispatch(TabActions.removeTab(tabId)),
  activateTab: (tabId) => dispatch(TabActions.activateTab(tabId)),
  dragStart: (dragEventObj) => dispatch(dragStart(dragEventObj)),
})
)(_TabLabel)


export default TabBar
