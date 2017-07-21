import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
import Terminal from './Terminal'
import { Tab, TabGroup } from './state'

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
]

@observer
class TerminalContainer extends Component {
  constructor (props) {
    super(props)
    const tab = new Tab()
    this.tabGroup = new TabGroup()
    this.tabGroup.addTab(tab)
  }

  render () {
    return (
      <div className='tab-container'>
        <TabBar tabGroup={this.tabGroup}
          addTab={() => this.tabGroup.addTab(new Tab())}
          contextMenuItems={contextMenuItems}/>
        <TabContent tabGroup={this.tabGroup} >
          {this.tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab} >
              <Terminal tab={tab} />
            </TabContentItem>
          )}
        </TabContent>
      </div>
    )
  }
}

export default TerminalContainer
