import { dispatch as $d } from '../../store'
import store from 'mobxStore'
import * as Tab from 'components/Tab/actions'
import * as PaneActions from 'components/Pane/actions'

export default {
  'tab:close': (c) => {
    Tab.removeTab(c.context)
  },

  'tab:close_other': (c) => {
    Tab.removeOtherTab(c.context)
  },

  'tab:close_all': (c) => {
    Tab.removeAllTab(c.context)
  },

  'tab:split_v': (c) => {
    const panes = store.PaneState.panes
    const pane = panes.values().find(pane =>
      pane.contentId === c.context.tabGroupId
    )
    PaneActions.splitTo(pane.id, 'bottom').then(newPaneId =>
      Tab.moveTabToPane(c.context.id, newPaneId)
    )
  },

  'tab:split_h': (c) => {
    const panes = store.PaneState.panes
    const pane = panes.values().find(pane =>
      pane.contentId === c.context.tabGroupId
    )
    PaneActions.splitTo(pane.id, 'right').then(newPaneId =>
      Tab.moveTabToPane(c.context.id, newPaneId)
    )
  },
  'tab:zenmode': () => {
    const tab = document.querySelector('.tab-content-item.active');
    if (tab.requestFullscreen) {
      tab.classList.add('zenmode');
      tab.requestFullscreen();
    } else if (tab.webkitRequestFullscreen) {
      tab.classList.add('zenmode');
      tab.webkitRequestFullscreen();
    } else if (tab.mozRequestFullScreen) {
      tab.classList.add('zenmode');
      tab.mozRequestFullScreen();
    } else if (tab.msRequestFullscreen) {
      tab.classList.add('zenmode');
      tab.msRequestFullscreen();
    }
  }
}

function exitFullScreen() {
  const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
  if (!isFull) {
    const tab = document.querySelector('.tab-content-item.active');
    tab.classList.remove('zenmode');
  }
}

document.addEventListener('fullscreenchange', () => exitFullScreen());
document.addEventListener('webkitfullscreenchange', () => exitFullScreen());
document.addEventListener('mozfullscreenchange', () => exitFullScreen());
document.addEventListener('msfullscreenchang', () => exitFullScreen());
