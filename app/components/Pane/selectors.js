const getPane = (state, pane) => typeof pane === 'object' ? state.panes[pane.id] : state.panes[pane]

export const getPaneById = (state, id) => state.panes[id]
export const getParent = (state, pane) => state.panes[getPane(state, pane).parentId]
export const getNextSibling = (state, pane) => {
  pane = getPane(state, pane)
  const parent = getParent(state, pane)
  const nextSiblingId = parent.views[parent.views.indexOf(pane.id) + 1]
  return state.panes[nextSiblingId]
}

const makePosPaneObj = (panes, pane, parent, accumulator) => {
  if (!parent.totalSize) {
    parent.totalSize = parent.views.reduce((sum, paneId) => sum + panes[paneId].size, 0)
  }
  if (!parent.children) parent.children = []

  const paneWithPos = {...pane}

  const dir = parent.flexDirection
  const {top: pTop, left: pLeft, right: pRight, bottom: pBottom} = parent.pos
  const prevPaneWithPos = parent.children[parent.children.length - 1]
  const {bottom: prevBottom, right: prevRight} = prevPaneWithPos ? prevPaneWithPos.pos : {bottom: pTop, right: pLeft}

  paneWithPos.pos = {
    top: dir === 'row' ? pTop : prevBottom,
    left: dir === 'column' ? pLeft : prevRight,
    bottom: dir === 'row' ? pBottom : (pBottom - pTop) * pane.size / parent.totalSize + prevBottom,
    right: dir === 'column' ? pRight : (pRight - pLeft) * pane.size / parent.totalSize + prevRight
  }

  paneWithPos.parent = parent
  parent.children.push(paneWithPos)

  if (pane.views.length) {
    pane.views.forEach((paneId) => {
      return makePosPaneObj(panes, panes[paneId], paneWithPos, accumulator)
    })
  } else {
    accumulator.push(paneWithPos)
  }

  return accumulator
}

export const getPanesWithPosMap = (state) => {
  const rootPane = state.panes[state.rootPaneId]
  const rootPaneWithPos = {...rootPane}
  rootPaneWithPos.pos = {
    left: 0,
    top: 0,
    right: 100,
    bottom: 100
  }
  let panesMap = {...state.panes}
  let accumulator = []
  rootPaneWithPos.views.reduce((accumulator, paneId) => {
    return makePosPaneObj(panesMap, panesMap[paneId], rootPaneWithPos, accumulator)
  }, accumulator)
  return accumulator
}
