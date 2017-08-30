import React from 'react'
import MenuBar from '../MenuBar'
import TopBar from '../TopBar'
import StatusBar from '../StatusBar'
import PanesContainer from '../Pane'
import GitGraph from 'components/Git/GitGraph'
import TerminalContainer from '../Terminal'
import FileTree from '../FileTree'
import SideBar from './SideBar/SideBar'
import { SidePanelContainer, SidePanelView } from './SideBar/SidePanel'
import FileList from '../Tab/fileList'


const PanelContent = ({ panel }) => {
  switch (panel.contentType) {
    case 'MENUBAR':
      return <MenuBar />
    case 'BREADCRUMBS':
      return <TopBar />
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
          <SidePanelView key='project' label={{ text: i18n`panel.left.project`, icon: 'octicon octicon-code' }} active>
            <FileTree />
          </SidePanelView>
          <SidePanelView key='working' label={{ text: i18n`panel.left.working`, icon: 'fa fa-folder-open-o' }}>
            <FileList />
          </SidePanelView>
        </SidePanelContainer>
      )
    case 'PANEL_BOTTOM':
      const labels = {
        terminal: { text: i18n`panel.bottom.terminal`, icon: 'octicon octicon-terminal', weight: 2 },
        gitGraph: { text: i18n`panel.bottom.gitGraph`, icon: 'octicon octicon-git-commit' },
        gitHistory: { text: i18n`panel.bottom.history`, icon: 'octicon octicon-history' },
      }
      return (
        <SidePanelContainer side='bottom'>
          <SidePanelView key='terminal' label={labels.terminal} >
            <TerminalContainer />
          </SidePanelView>

          <SidePanelView key='gitGraph' label={labels.gitGraph} >
            <GitGraph />
          </SidePanelView>
        </SidePanelContainer>
      )
    default:
  }

  return <div>Panel Placeholder</div>
}

export default PanelContent
