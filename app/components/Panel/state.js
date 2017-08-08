import _ from 'lodash'
import extendObservableStrict from 'utils/extendObservableStrict'
import PaneScope from 'commons/Pane/state'
import { extendObservable, computed, action } from 'mobx'

const { state, BasePane } = PaneScope()

extendObservable(state, {
  activePanelId: null,
  get panels () { return this.entities },
  get rootPanel () {
    const rootPanel = this.panels.values().find(panel => panel.isRoot)
    return rootPanel || this.panels.values()[0]
  },
  get activePanel () {
    const activePanel = this.panels.get(this.activePanelId)
    return activePanel || this.rootPanel
  },
})
class Panel extends BasePane {
  constructor (opt) {
    super()
    extendObservableStrict(this, {
      id: opt.ref || _.uniqueId('panel_view_'),
      ref: '',
      direction: 'row',
      overflow: '',
      hide: false,
      size: 100,
      parentId: '',
      index: 0,
      contentType: '',
      resizable: true,
      _disableResizeBar: false,
    }, opt)

    state.entities.set(this.id, this)
  }

  @computed get disableResizeBar () {
    // if a panel is not resizable, then resize bar must be disabled
    if (!this.resizable) return true
    return this._disableResizeBar
  }
  set disableResizeBar (value) {
    this._disableResizeBar = value
  }
}

// this can source from external config file or some API
const BasePanelLayout = {
  ref: 'ROOT',
  direction: 'column',
  views: [
    { ref: 'MENUBAR', contentType: 'MENUBAR', resizable: false, overflow: 'visible' },
    { ref: 'BAR_TOP', contentType: 'BREADCRUMBS', resizable: false, overflow: 'visible' },
    { ref: 'PRIMARY_ROW',
      direction: 'row',
      views: [
        { ref: 'BAR_LEFT', resizable: false },
        { ref: 'STAGE',
          direction: 'column',
          views: [
            { direction: 'row',
              size: 75,
              views: [
                { ref: 'PANEL_LEFT', size: 20, contentType: 'PANEL_LEFT' },
                { ref: 'PANEL_CENTER', size: 80, contentType: 'PANES' },
                { ref: 'PANEL_RIGHT', size: 40, contentType: 'EXTENSION_RIGHT', hide: true },
              ],
            },
            { ref: 'PANEL_BOTTOM', size: 25, contentType: 'PANEL_BOTTOM', hide: true },
            { ref: 'BAR_BOTTOM', resizable: false, hide: false },
          ]
        },
        { ref: 'BAR_RIGHT', resizable: false, hide: false },
      ]
    },
    { ref: 'STATUSBAR', contentType: 'STATUSBAR', resizable: false, overflow: 'visible' },
  ]
}

const constructPanelState = action((panelConfig) => {
  const views = panelConfig.views
  delete panelConfig.views
  const panel = new Panel(panelConfig)

  if (!panel.resizable) {
    const prevSibling = panel.prev
    if (prevSibling) {
      prevSibling.disableResizeBar = true
    }
  }

  if (views && views.length) {
    views.forEach(
      (config, index) => constructPanelState({ ...config, index, parentId: panel.id })
    )
  }
})

constructPanelState(BasePanelLayout)

export default state
