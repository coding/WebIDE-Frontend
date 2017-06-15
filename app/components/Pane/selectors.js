import _ from 'lodash'

const getPane = (state, pane) => typeof pane === 'object' ? state.panes[pane.id] : state.panes[pane]

export const getPaneById = (state, id) => state.panes[id]
export const getParent = (state, pane) => state.panes[getPane(state, pane).parentId]

const getLeafChild = (state, pane, firstOrLast = 'first') => {
  pane = getPane(state, pane)
  while (pane.views.length) {
    const childPaneId = _[firstOrLast](pane.views)
    if (pane.id === childPaneId) { throw 'Weird we got a pane that has itself as child...' }
    pane = state.panes[childPaneId]
    if (!pane) break
  }
  return pane
}

const getSibling = (state, pane, offset, traverse = false, lookAround = false) => {
  pane = getPane(state, pane)
  let lookAroundWorks = false
  let parent = getParent(state, pane)
  let siblingId = parent.views[parent.views.indexOf(pane.id) + offset]
  if (!traverse) return state.panes[siblingId]

  while (!siblingId) {
    parent = getParent(state, pane)
    if (!parent) break
    siblingId = parent.views[parent.views.indexOf(pane.id) + offset]
    if (!siblingId && lookAround) {
      siblingId = parent.views[parent.views.indexOf(pane.id) - offset]
      if (siblingId) { lookAroundWorks = true; console.log(siblingId) }
    }
    pane = parent
  }

  let firstOrLast
  if (offset > 0) {
    firstOrLast = lookAroundWorks ? 'last' : 'first'
  } else {
    firstOrLast = lookAroundWorks ? 'first' : 'last'
  }
  return getLeafChild(state, state.panes[siblingId], firstOrLast)
}

export const getNextSibling = (state, pane, traverse, lookAround) => getSibling(state, pane, 1, traverse, lookAround)
export const getPrevSibling = (state, pane, traverse, lookAround) => getSibling(state, pane, -1, traverse, lookAround)

const makePosPaneObj = (panes, pane, parent, accumulator) => {
  if (!parent.totalSize) {
    parent.totalSize = parent.views.reduce((sum, paneId) => sum + panes[paneId].size, 0)
  }
  if (!parent.children) parent.children = []

  const paneWithPos = { ...pane }

  const dir = parent.flexDirection
  const { top: pTop, left: pLeft, right: pRight, bottom: pBottom } = parent.pos
  const prevPaneWithPos = parent.children[parent.children.length - 1]
  const { bottom: prevBottom, right: prevRight } = prevPaneWithPos ? prevPaneWithPos.pos : { bottom: pTop, right: pLeft }

  paneWithPos.pos = {
    top: dir === 'row' ? pTop : prevBottom,
    left: dir === 'column' ? pLeft : prevRight,
    bottom: dir === 'row' ? pBottom : (pBottom - pTop) * pane.size / parent.totalSize + prevBottom,
    right: dir === 'column' ? pRight : (pRight - pLeft) * pane.size / parent.totalSize + prevRight
  }

  paneWithPos.parent = parent
  parent.children.push(paneWithPos)

  if (pane.views.length) {
    pane.views.forEach(paneId => makePosPaneObj(panes, panes[paneId], paneWithPos, accumulator))
  } else {
    accumulator.push(paneWithPos)
  }

  return accumulator
}

export const getPanesWithPosMap = (state) => {
  const rootPane = state.panes[state.rootPaneId]
  const rootPaneWithPos = { ...rootPane }
  rootPaneWithPos.pos = {
    left: 0,
    top: 0,
    right: 100,
    bottom: 100
  }
  const panesMap = { ...state.panes }
  const accumulator = []
  rootPaneWithPos.views.reduce((accumulator, paneId) => makePosPaneObj(panesMap, panesMap[paneId], rootPaneWithPos, accumulator), accumulator)
  return accumulator
}
