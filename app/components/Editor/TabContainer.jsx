import _ from 'lodash';
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer, inject } from 'mobx-react'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
import * as TabActions from 'commons/Tab/actions';
import EditorWrapper from '../EditorWrapper'
import { TablessCodeMirrorEditor } from '../CodeMirrorEditor'

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
  static propTypes = {
    containingPaneId: PropTypes.string,
    tabGroup: PropTypes.object,
    createGroup: PropTypes.func,
  };

  render () {
    const tabGroup = this.props.tabGroup
    if (!tabGroup) return null
    return (
      <div className='tab-container'>
        <TabBar tabGroup={tabGroup} contextMenuItems={contextMenuItems}/>
        <TabContent tabGroup={tabGroup} >
          {tabGroup.tabs.length ? tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab} >
              <EditorWrapper tab={tab} />
            </TabContentItem>
          )
          : <TabContentItem tab={{ isActive: true }}>
              <TablessCodeMirrorEditor tabGroupId={tabGroup.id} />
            </TabContentItem>
          }
        </TabContent>
      </div>
    )
  }
}

export default TabContainer
