/* @flow weak */
import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import * as TabActions from './actions';
import * as PaneActions from '../Pane/actions';
import { dragStart } from '../DragAndDrop/actions';
import TabBar from './TabBar'
import TabContent from './TabContent'

class TabContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tabGroupId: props.tabGroupId || _.uniqueId('tab_group_'),
      type: props.defaultContentType
    }
  }

  componentWillMount () {
    const { tabGroups, createGroup, updatePane, defaultContentType, containingPaneId } = this.props
    const { tabGroupId } = this.state
    const tabGroup = tabGroups.get(tabGroupId)
    if (!tabGroup) createGroup(tabGroupId, defaultContentType)
    if (containingPaneId) updatePane({ id: containingPaneId, tabGroupId })
  }

  componentDidMount () {
    if (this.props.defaultContentType == 'terminal') setTimeout(() => this.props.addTab(this.state.tabGroupId), 0)
  }

  render () {
    const tabGroup = this.props.tabGroups.get(this.state.tabGroupId)
    if (!tabGroup) return null
    return (
      <div className='tab-container'>
        <TabBar tabIds={tabGroup.tabIds}
          tabGroupId={this.state.tabGroupId}
          containingPaneId={this.props.containingPaneId} />
        <TabContent tabIds={tabGroup.tabIds} {...this.props} />
      </div>
    )
  }
}

export default connect((state, { tabGroupId }) => ({
  tabGroups: state.TabState.tabGroups
}), dispatch => ({
  createGroup: (tabGroupId, defaultContentType) =>
    dispatch(TabActions.createGroup(tabGroupId, defaultContentType)),
  addTab: (tabGroupId) => dispatch(TabActions.createTabInGroup(tabGroupId)),
  updatePane: (updatePatch) => dispatch(PaneActions.updatePane(updatePatch))
})
)(TabContainer)
