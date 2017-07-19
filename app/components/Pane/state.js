import uniqueId from 'lodash/uniqueId'
import { extendObservable, observable, computed, action, autorun, autorunAsync } from 'mobx'
import EditorTabState, { TabGroup } from 'components/Tab/state'
import PaneScope from 'commons/Pane/state'

const { state, BasePane } = PaneScope()

extendObservable(state, {
  get panes () { return this.entities },
  activePaneId: null,
  autoCloseEmptyPane: true,
  get rootPane () {
    const rootPane = this.panes.values().find(pane => pane.isRoot)
    return rootPane || this.panes.values()[0]
  },
  get activePane () {
    const activePane = this.panes.get(this.activePaneId)
    return activePane || this.rootPane
  },
})

class Pane extends BasePane {
  constructor (paneConfig) {
    super()

    extendObservable(this, {
      id: uniqueId('pane_view_'),
      flexDirection: 'row',
      size: 100,
      parentId: '',
      index: 0,
    }, paneConfig)

    this.contentType = 'tabGroup'
    const tabGroup = this.tabGroup || new TabGroup()
    this.contentId = tabGroup.id
    state.entities.set(this.id, this)
  }

  @observable contentId = ''

  @computed
  get tabGroup () {
    if (this.views.length) return null
    return EditorTabState.tabGroups.get(this.contentId)
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
  flexDirection: 'row',
  size: 100,
})

state.panes.set(rootPane.id, rootPane)

autorun('normalize pane indexes', () => {
  state.panes.forEach(parentPane =>
    parentPane.views.forEach((pane, index) => {
      if (pane.index !== index) pane.index = index
    })
  )
})

autorunAsync('short-circuit unnecessary internal pane node', () => {
  // pane.parent -> pane -> lonelyChild
  // => pane.panret -> lonelyChild
  //    delete pane
  state.panes.forEach((pane) => {
    if (!pane) return
    if (pane.views.length === 1) {
      const lonelyChild = pane.views[0]
      lonelyChild.parentId = pane.parentId
      state.panes.delete(pane.id)
    }
  })
})

autorunAsync('auto delete pane without tabs', () => {
  if (state.autoCloseEmptyPane) {
    state.panes.forEach((pane) => {
      if (!pane) return
      if (!pane.views.length && pane.tabGroup && pane.tabGroup.tabs.length === 0) {
        pane.destroy()
      }
    })
  }
})

export default state
export { Pane }
