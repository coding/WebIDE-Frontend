import { extendObservable, observable, computed } from 'mobx'

function PaneScope () {
  const state = observable({
    entities: observable.map({})
  })

  class BasePane {
    @computed
    get isRoot () {
      return !this.parentId
    }

    @computed
    get parent () {
      const parent = state.entities.get(this.parentId)
      if (parent === this) throw Error(`Pane/Panel ${this.id} is parent of itself.`)
      return parent
    }

    @computed
    get views () {
      return state.entities.values()
        .filter(pane => pane.parentId === this.id)
        .sort((a, b) => a.index - b.index)
    }

    @computed
    get siblings () {
      if (!this.parent) return [this]
      return this.parent.views
    }

    @computed
    get leafChildren () {
      if (!this.views.length) return [this]
      return this.views.reduce((acc, child) =>
        acc.concat(child.leafChildren)
      , [])
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

  return { BasePane, state }
}

export default PaneScope
