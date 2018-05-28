import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer, inject } from 'mobx-react'
import { TabBar, TabContent, TabContentItem } from 'commons/Tab'
import Editor from 'components/Editor'
import MonacoEditor from 'components/MonacoEditor'
import { TablessCodeEditor } from 'components/Editor/components/CodeEditor'
import i18n from 'utils/createI18n'
import config from 'config'
import URI from 'vscode-uri'
import { Workspace, WorkspaceFolder } from 'components/MonacoEditor/CloudStudioLanguageClient/MonacoWrokSpace'
import WelcomePage from './WelcomePage'

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

  constructor (props) {
    super(props)

    this.state = {
      fullScreenActiveContent: false,
    }

    this.workspaceFolder = new WorkspaceFolder(
      {
        uri: `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`,
        index: 0,
        name: config.spaceKey
      }
    )
    this.workspace = new Workspace(
      config.spaceKey,
      'CloudStudioWorkSpace',
      [this.workspaceFolder],
      URI.parse(`/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`),
      0,
    )
    console.log(this.workspace)
  }

  handleFullScreen = (value) => {
    const { fullScreenActiveContent } = this.state
    this.setState({
      fullScreenActiveContent: value || !fullScreenActiveContent
    })
  }

  render () {
    const { tabGroup, closePane } = this.props
    const { fullScreenActiveContent } = this.state
    if (!tabGroup) return null
    return (
      <div className={cx('tab-container', { fullscreen: fullScreenActiveContent })}>
        <TabBar tabGroup={tabGroup}
          contextMenuItems={contextMenuItems}
          closePane={closePane}
          handleFullScreen={this.handleFullScreen}
        />
        <TabContent tabGroup={tabGroup} >
          {tabGroup.tabs.length ? tabGroup.tabs.map(tab =>
            <TabContentItem key={tab.id} tab={tab}>
              {this.renderContent(tab)}
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

  renderContent (tab) {
    if (tab.type === 'welcome') {
      return <WelcomePage />
    }
    return <MonacoEditor tab={tab} active={tab.isActive} />
  }
}

export default TabContainer
