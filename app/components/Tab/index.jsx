/* @flow weak */
import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { createStore } from 'redux';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as TabActions from './actions';
import { dragStart } from '../DragAndDrop/actions';

const Tab = ({getGroupById, groupId, ...otherProps}) => {
  let tabGroup = getGroupById(groupId)
  return (
    <div className='tab-container'>
      <TabBar tabs={tabGroup.tabs} groupId={groupId} {...otherProps} />
      <TabContent tabs={tabGroup.tabs} groupId={groupId} {...otherProps} />
    </div>
  )
}

let TabBar = ({tabs, groupId, addTab, isDraggedOver, ...otherProps}) => {
  return (
    <div className='tab-bar' id={`tab_bar_${groupId}`} data-droppable='TABBAR'>
      <ul className='tab-labels'>
        { tabs.map(tab =>
          <TabLabel tab={tab} key={tab.id} {...otherProps} />
        ) }
      </ul>
      {isDraggedOver ? <div className='tab-label-insert-pos'></div>: null}
      <div className='tab-add-btn' onClick={e => addTab(groupId)} >＋</div>
      <div className='tab-show-list'>
        <i className='fa fa-sort-desc' />
      </div>
    </div>
  )
}
TabBar = connect((state, ownProps) => ({
  isDraggedOver: state.DragAndDrop.meta
    ? state.DragAndDrop.meta.tabBarTargetId === `tab_bar_${ownProps.groupId}`
    : false
})
)(TabBar)

let TabLabel = ({tab, isDraggedOver, removeTab, dispatch, activateTab}) => {
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
      onDragStart={e => dispatch(dragStart({sourceType: 'TAB', sourceId: tab.id}))}
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

TabLabel = connect((state, ownProps) => ({
  isDraggedOver: state.DragAndDrop.meta
    ? state.DragAndDrop.meta.tabLabelTargetId === `tab_label_${ownProps.tab.id}`
    : false
})
)(TabLabel)


const TabContent = ({tabs, defaultContentClass}) => {
  let tabContentItems = tabs.map(tab => {
    return <TabContentItem key={tab.id} tab={tab} defaultContentClass={defaultContentClass} />;
  })
  return (
    <div className='tab-content'>
      <ul className='tab-content-container'>{
        tabContentItems.length
        ? tabContentItems
        : <div className='tab-content-placeholder-monkey'></div>
      }</ul>
    </div>
  );
}

const TabContentItem = ({ tab, defaultContentClass }) => {
  return (
    <div className={cx('tab-content-item', {'active': tab.isActive})}>
      {React.createElement(defaultContentClass, { tab })}
    </div>
  );
};


class TabContainer extends Component {
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
      <Tab {...this.props} groupId={this.state.groupId} />
    )
  }
}

TabContainer = connect(
  state => state.TabState,
  dispatch => {
    return {
      addTab: (groupId) => dispatch(TabActions.createTabInGroup(groupId)),
      removeTab: (tabId) => dispatch(TabActions.removeTab(tabId)),
      activateTab: (tabId) => dispatch(TabActions.activateTab(tabId)),
      dispatch: dispatch
    }
  }
)(TabContainer)

export default TabContainer
