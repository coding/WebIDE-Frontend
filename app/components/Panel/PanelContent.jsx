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
          <SidePanelView label={{ text: 'Project', icon: 'octicon octicon-code' }} active>
            <FileTree />
          </SidePanelView>
        </SidePanelContainer>
      )
    case 'PANEL_BOTTOM':
      // return <GitHistoryView />
      return (
        <SidePanelContainer side='bottom'>
          <SidePanelView label={{ text: 'Terminal', icon: 'octicon octicon-terminal' }} active>
            <TerminalContainer />
          </SidePanelView>

          <SidePanelView label={{ text: 'History', icon: 'octicon octicon-history' }} >
            <GitHistoryView />
          </SidePanelView>

        </SidePanelContainer>
      )
    default:
  }

  return <div>Panel Placeholder</div>
}

export default PanelContent
