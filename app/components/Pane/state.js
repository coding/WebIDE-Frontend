import uniqueId from 'lodash/uniqueId'
import { extendObservable, observable, computed, autorun } from 'mobx'
import EditorTabState, { TabGroup } from 'components/Editor/state'

const state = observable({
  panes: observable.map({}),
  activePaneId: null,
  rootPaneId: null,
  get rootPane () {
    const rootPane = this.panes.get(this.rootPaneId)
    return rootPane || this.panes.values()[0]
  },
  get activePane () {
    const activePane = this.panes.get(this.activePaneId)
    return activePane || this.rootPane
  },
})

class BasePane {
  constructor (paneConfig) {
    const defaults = {
      id: uniqueId('pane_view_'),
      flexDirection: 'row',
      size: 100,
      parentId: '',
      index: 0,
    }

    paneConfig = Object.assign({}, defaults, paneConfig)
    extendObservable(this, paneConfig)
    state.panes.set(this.id, this)
  }

  @computed
  get parent () {
    return state.panes.get(this.parentId)
  }

  @computed
  get views () {
    return state.panes.values()
      .filter(pane => pane.parentId === this.id)
      .sort((a, b) => a.index - b.index)
  }
}

class Pane extends BasePane {
  constructor (paneConfig) {
    super(paneConfig)
    this.contentType = 'tabGroup'
    const tabGroup = this.tabGroup || new TabGroup()
    this.contentId = tabGroup.id
  }

  @observable contentId = ''

  @computed
  get tabGroup () {
    return EditorTabState.tabGroups.get(this.contentId)
  }
}

const rootPane = new Pane({
  id: 'pane_view_1',
  flexDirection: 'row',
  size: 100,
})

state.panes.set(rootPane.id, rootPane)
state.rootPaneId = rootPane.id

autorun(() => {
  state.panes.forEach(parentPane =>
    parentPane.views.forEach((pane, index) => {
      if (pane.index !== index) pane.index = index
    })
  )
})

export default state
export { Pane }
