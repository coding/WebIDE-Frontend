import React from 'react'
import MenuBar from '../MenuBar'
import Breadcrumbs from '../Breadcrumbs'
import StatusBar from '../StatusBar'
import PanesContainer from '../Pane'
import FileTree from '../FileTree'
import TerminalContainer from '../Terminal'
import SideBar from './SideBar'
import { SidePanelContainer, SidePanelView } from './SidePanel'
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

  switch (panel.id) {
    case 'BAR_RIGHT':
    case 'BAR_LEFT':
    case 'BAR_BOTTOM':
      return <SideBar side={panel.id.toLowerCase().replace('bar_', '')} />

    case 'PANEL_RIGHT':
      return <SidePanelContainer side='right' />

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
        gitGraph: { text: 'Git Logs', icon: 'octicon octicon-git-commit' },
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

        </SidePanelContainer>
      )
    default:
  }

  return <div>Panel Placeholder</div>
}

export default PanelContent
