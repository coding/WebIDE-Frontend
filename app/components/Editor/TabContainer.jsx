import _ from 'lodash';
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
import { connect } from 'react-redux';
import * as TabActions from './actions';
import EditorWrapper from '../EditorWrapper'

const contextMenuItems = [
  {
    name: 'Close',
    icon: '',
    command: 'tab:close'
  }, {
    name: 'Close Others',
    icon: '',
    command: 'tab:close_other'
  }, {
    name: 'Close All',
    icon: '',
    command: 'tab:close_all'
  },
  { name: '-' },
  {
    name: 'Vertical Split',
    icon: '',
    command: 'tab:split_v'
  }, {
    name: 'Horizontal Split',
    icon: '',
    command: 'tab:split_h'
  }
]

@observer
class TabContainer extends Component {
  constructor (props) {
    super(props)
    this.tabGroupId = this.props.tabGroupId || _.uniqueId('tab_group_')
    this.tabGroup = this.props.tabGroups[this.tabGroupId]
    if (!this.tabGroup) this.props.createGroup(this.tabGroupId)
  }

  render () {
    const tabGroup = this.props.tabGroups[this.tabGroupId]
    if (!tabGroup) return null
    return (
      <div className='tab-container'>
        <TabBar tabGroup={tabGroup} contextMenuItems={contextMenuItems}/>
        <TabContent tabGroup={tabGroup} >
          {tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab} >
              <EditorWrapper tab={tab} />
            </TabContentItem>
          )}
        </TabContent>
      </div>
    )
  }
}

export default connect((state, { tabGroupId }) => {
  const tabGroups = state.EditorTabState.tabGroups
  return {
    tabGroups: tabGroups,
  }
}, dispatch => ({
  createGroup: (tabGroupId, defaultContentType) =>
    dispatch(TabActions.createGroup(tabGroupId, defaultContentType)),
}))(TabContainer)
