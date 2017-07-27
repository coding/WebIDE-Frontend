import React from 'react'
import MenuBar from '../MenuBar'
import Breadcrumbs from '../Breadcrumbs'
import StatusBar from '../StatusBar'
import PanesContainer from '../Pane'
import FileTree from '../FileTree'
import TerminalContainer from '../Terminal'
import SideBar from './SideBar/SideBar'
import { SidePanelContainer, SidePanelView } from './SideBar/SidePanel'
import GitGraph from 'components/Git/GitGraph'
import Collaboration from 'components/Collaboration'
import i18n from 'utils/createI18n'


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
      return (
        <SidePanelContainer side='right'>
          <SidePanelView key='collaborate' label={{ text: 'Collaborate', icon: 'fa fa-users', weight: 1000 }} active >
            <Collaboration />
          </SidePanelView>
        </SidePanelContainer>
      )

    case 'PANEL_LEFT':
      return (
        <SidePanelContainer side='left'>
          <SidePanelView key='project' label={{ text: i18n`panel.left.project`, icon: 'octicon octicon-code' }} active >
            <FileTree />
          </SidePanelView>
        </SidePanelContainer>
      )
    case 'PANEL_BOTTOM':
      const labels = {
        terminal: { text: i18n`panel.bottom.terminal`, icon: 'octicon octicon-terminal' },
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
