import _ from 'lodash';
import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer, inject } from 'mobx-react'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
import Editor from 'components/Editor'
import { TablessCodeEditor } from 'components/Editor/components/CodeEditor'
import i18n from 'utils/createI18n'

const contextMenuItems = [
  {
    name: i18n`tab.contextMenu.close`,
    icon: '',
    command: 'tab:close'
  }, {
    name: i18n`tab.contextMenu.closeOthers`,
    icon: '',
    command: 'tab:close_other'
  }, {
    name: i18n`tab.contextMenu.closeAll`,
    icon: '',
    command: 'tab:close_all'
  },
  { isDivider: true },
  {
    name: i18n`tab.contextMenu.verticalSplit`,
    icon: '',
    command: 'tab:split_v'
  }, {
    name: i18n`tab.contextMenu.horizontalSplit`,
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
    closePane: PropTypes.func,
  };

  render () {
    const { tabGroup, closePane } = this.props
    if (!tabGroup) return null
    return (
      <div className='tab-container'>
        <TabBar tabGroup={tabGroup}
          contextMenuItems={contextMenuItems}
          closePane={closePane}
        />
        <TabContent tabGroup={tabGroup} >
          {tabGroup.tabs.length ? tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab} >
              <Editor tab={tab} />
            </TabContentItem>
          )
          : <TabContentItem tab={{ isActive: true }}>
              <TablessCodeEditor tabGroupId={tabGroup.id} />
            </TabContentItem>
          }
        </TabContent>
      </div>
    )
  }
}

export default TabContainer
