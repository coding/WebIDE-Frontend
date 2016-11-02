/* @flow weak */
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { createStore } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import * as TabActions from './actions'
import { dragStart } from '../DragAndDrop/actions'
import AceEditor from '../AceEditor'

const TabView = ({getGroupById, groupId, ...otherProps}) => {
  let tabGroup = getGroupById(groupId)
  return (
    <div className='tab-component'>
      <TabBar tabs={tabGroup.tabs} groupId={groupId} {...otherProps} />
      <TabContent tabs={tabGroup.tabs} groupId={groupId} {...otherProps} />
    </div>
  )
}

const TabBar = ({tabs, groupId, addTab, ...otherProps}) => {
  return (
    <div className='tab-bar'>
      <ul className='tabs'>
        { tabs.map(tab =>
          <Tab tab={tab} key={tab.id} {...otherProps} />
        ) }
      </ul>
      <div className='tab-add-btn' onClick={e => addTab(groupId)} >＋</div>
      <div className='tab-show-list'>
        <i className='fa fa-sort-desc' />
      </div>
    </div>
  )
}

const Tab = ({tab, removeTab, dispatch, activateTab}) => {
  const possibleStatus = {
    'modified': '*',
    'warning': '!',
    'offline': '*',
    'sync': '[-]',
    'loading': <i className='fa fa-spinner fa-spin' />
  }

  return (
    <li className={cx('tab', {
      active: tab.isActive,
      modified: tab.flags.modified
    })}
      onClick={e => activateTab(tab.id)}
      draggable='true'
      onDragStart={e => dispatch(dragStart({sourceType: 'TAB', sourceId: tab.id}))}
    >
      <div className='title'>{tab.title}</div>
      <div className='control'>
        <i className='close' onClick={e => { e.stopPropagation(); removeTab(tab.id) }}>×</i>
        <i className='dot'></i>
      </div>
    </li>
  )
}

const TabContent = ({tabs, defaultContentClass}) => {
  return (
    <div className='tab-content'>
      <ul className='tab-content-container'>{
        tabs.map(tab => {
          return <TabContentItem key={tab.id} tab={tab} defaultContentClass={defaultContentClass} />
        })
      }</ul>
    </div>
  )
}

const TabContentItem = ({tab, defaultContentClass}) => {
  return (
    <div className={cx('tab-content-item', {'active': tab.isActive})}>
      {React.createElement(defaultContentClass, {
        tab: tab
      })}
    </div>
  )
}

class TabViewContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      groupId: props.tabGroupId || _.uniqueId('tab_group_'),
      type: props.defaultContentType
    }
  }

  componentWillMount () {
    let tabGroup = this.props.getGroupById(this.props.tabGroupId)
    if (!tabGroup) this.props.dispatch(TabActions.createGroup(this.state.groupId, this.props.defaultContentType))
  }

  componentWillUnmount () {
    // this.props.dispatch(TabActions.removeGroup(this.state.groupId))
  }

  componentDidMount () {
    if (this.props.defaultContentType == 'terminal') setTimeout(() => this.props.addTab(this.state.groupId), 1)
  }

  render () {
    return (
      <TabView {...this.props} groupId={this.state.groupId} />
    )
  }
}

TabViewContainer = connect(
  state => state.TabState,
  dispatch => {
    return {
      addTab: (groupId) => dispatch(TabActions.createTabInGroup(groupId)),
      removeTab: (tabId) => dispatch(TabActions.removeTab(tabId)),
      activateTab: (tabId) => dispatch(TabActions.activateTab(tabId)),
      dispatch: dispatch
    }
  }
)(TabViewContainer)

export default TabViewContainer
