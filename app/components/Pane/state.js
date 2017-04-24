import uniqueId from 'lodash/uniqueId'
import { extendObservable, observable, computed, action, autorun, autorunAsync } from 'mobx'
import EditorTabState, { TabGroup } from 'components/Editor/state'

const state = observable({
  panes: observable.map({}),
  activePaneId: null,
  rootPaneId: null,
  autoCloseEmptyPane: true,
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

  @computed
  get siblings () {
    return this.parent.views
  }

  @computed
  get prev () {
    return this.siblings[this.index - 1]
  }

  @computed
  get next () {
    return this.siblings[this.index + 1]
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
    if (this.views.length) return null
    return EditorTabState.tabGroups.get(this.contentId)
  }

  @computed
  get leafChildren () {
    if (!this.views.length) return [this]
    return this.views.reduce((acc, pane) => {
      return acc.concat(pane.leafChildren)
    }, [])
  }

  @action
  destroy () {
    if (this.isRoot) return
    const parent = this.parent
    if (!parent) return

    if (this.views.length) {
      this.views.forEach(pane => pane.destroy())
    }

    let inherior = this.prev || this.next
    if (!inherior) {
      parent.contentId = this.contentId
    } else {
      if (!inherior.tabGroup) {
        const candidates = inherior.leafChildren
        inherior = this.prev ? candidates[candidates.length - 1] : candidates[0]
      }
      inherior.tabGroup.merge(this.tabGroup)
    }

    state.panes.delete(this.id)
  }
}

const rootPane = new Pane({
  id: 'pane_view_1',
  flexDirection: 'row',
  size: 100,
  isRoot: true,
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

autorunAsync(() => {
  state.panes.forEach(pane => {
    if (!pane || pane.isRoot) return
    if (pane.views.length === 1) {
      pane.contentId = pane.views[0].contentId
      state.panes.delete(pane.views[0].id)
    }
  })
})

autorun('auto delete pane without tabs', () => {
  if (state.autoCloseEmptyPane) {
    state.panes.forEach(pane => {
      if (!pane) return
      if (!pane.views.length && pane.tabGroup && pane.tabGroup.tabs.length === 0) {
        pane.destroy()
      }
    })
  }
})

export default state
export { Pane }
