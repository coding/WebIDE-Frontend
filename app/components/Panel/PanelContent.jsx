/* @flow weak */
import React, { Component, PropTypes } from 'react'
import MenuBar from '../MenuBar'
import Breadcrumbs from '../Breadcrumbs'
import StatusBar from '../StatusBar'
import PanesContainer from '../Pane'
import FileTree from '../FileTree'
import ExtensionPanelContent from './ExtensionPanelContent'
import TerminalContainer from '../Terminal'
import SideBar, { SideBar2 } from './SideBar'
import { SidePanelContainer, SidePanelView } from './SidePanel'
import GitHistoryView from '../Git/GitHistoryView'
import GitGraph from 'components/Git/GitGraph'


const PanelContent = ({ panel }) => {
  switch (panel.contentType) {
    case 'MENUBAR':
      return <MenuBar />
    case 'BREADCRUMBS':
      return <Breadcrumbs />
    case 'FILETREE':
      return <FileTree />
    case 'PANES':
      return <PanesContainer />
    case 'STATUSBAR':
      return <StatusBar />

    default:
  }

  switch (panel.ref) {
    case 'BAR_RIGHT':
      return <SideBar side={panel.ref.toLowerCase().replace('bar_', '')} />
    case 'BAR_LEFT':
    case 'BAR_BOTTOM':
      return <SideBar2 side={panel.ref.toLowerCase().replace('bar_', '')} />


    case 'PANEL_RIGHT':
      return <ExtensionPanelContent side={panel.contentType.toLowerCase().replace('extension_', '')} />
    case 'PANEL_LEFT':
      return (
        <SidePanelContainer side='left'>
          <SidePanelView label={{ text: 'Project', icon: 'octicon octicon-code' }} active >
            <FileTree />
          </SidePanelView>
        </SidePanelContainer>
      )
    case 'PANEL_BOTTOM':
      const labels = {
        terminal: { text: 'Terminal', icon: 'octicon octicon-terminal' },
        gitGraph: { text: 'Graph', icon: 'octicon octicon-git-commit' },
        gitHistory: { text: 'History', icon: 'octicon octicon-history' },
      }
      return (
        <SidePanelContainer side='bottom'>
          <SidePanelView label={labels.terminal} active >
            <TerminalContainer />
          </SidePanelView>

          <SidePanelView label={labels.gitGraph} >
            <GitGraph />
          </SidePanelView>

          <SidePanelView label={labels.gitHistory} >
            <GitHistoryView />
          </SidePanelView>

        </SidePanelContainer>
      )
    default:
  }

  return <div>Panel Placeholder</div>
}

export default PanelContent
