import _ from 'lodash'
export const getPanel = (state, panel) =>
  typeof panel === 'object' ? state.panels[panel.id] : state.panels[panel]

export const getParent = (state, panel) => state.panels[getPanel(state, panel).parentId]

export const getSibling = (state, panel, offset) => {
  panel = getPanel(state, panel)
  let parent = getParent(state, panel)
  let siblingId = parent.views[parent.views.indexOf(panel.id) + offset]
  return state.panels[siblingId]
}

export const getNextSibling = (state, panel) => getSibling(state, panel, 1)
export const getPrevSibling = (state, panel) => getSibling(state, panel, -1)

export const getPanelByRef = (state, ref) => _(state.panels).find(v => v.ref === ref)
