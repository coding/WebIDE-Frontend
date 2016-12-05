export const getPaneById = (state, id) => state.panes[id]
export const getParent = (state, pane) => state.panes[pane.parentId]
export const getNextSibling = (state, pane) => {
  let parent = getParent(state, pane)
  let nextSiblingId = parent.views[parent.views.indexOf(pane.id) + 1]
  return state.panes[nextSiblingId]
}
