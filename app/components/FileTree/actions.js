/* @flow weak */
import _ from 'lodash'
import { createAction } from 'redux-actions'
import api from '../../api'
import * as TabActions from '../Tab/actions'

export const FILETREE_SELECT_NODE = 'FILETREE_SELECT_NODE'
export const FILETREE_SELECT_NODE_KEY = 'FILETREE_SELECT_NODE_KEY'
export function selectNode (node, multiSelect = false) {
  if (typeof node === 'number') {
    return {
      type: FILETREE_SELECT_NODE_KEY,
      payload: {offset: node}
    }
  } else {
    return {
      type: FILETREE_SELECT_NODE,
      payload: {node, multiSelect}
    }
  }
}

export function openNode (node, shouldBeFolded = null, deep = false) {
  return (dispatch, getState) => {
    if (node.isDir) {
      if (node.shouldBeUpdated) {
        api.fetchPath(node.path)
          .then(data => dispatch(loadNodeData(data, node)))
          .then(() => dispatch(toggleNodeFold(node, shouldBeFolded, deep)))
      } else {
        dispatch(toggleNodeFold(node, shouldBeFolded, deep))
      }
    } else {
      api.readFile(node.path)
        .then(data => {
          // get the last active group of type 'editor'
          var lastActiveEditorTabGroup, lastActiveOrder, TabState

          lastActiveOrder = 0
          TabState = getState().TabState
          lastActiveEditorTabGroup = TabState.getActiveGroup()

          while (lastActiveEditorTabGroup.type === 'terminal') {
            lastActiveEditorTabGroup = TabState.activatePrevGroup(--lastActiveOrder)
          }

          dispatch(TabActions.createTabInGroup(lastActiveEditorTabGroup.id, {
            id: _.uniqueId('tab_'),
            title: node.name,
            path: node.path,
            content: {
              body: data.content,
              path: node.path,
              contentType: node.contentType
            }
          }))
        })
    }
  }
}

export const FILETREE_FOLD_NODE = 'FILETREE_FOLD_NODE'
export const toggleNodeFold = createAction(FILETREE_FOLD_NODE,
  (node, shouldBeFolded = null, deep = false) => ({node, shouldBeFolded, deep})
)

export const FILETREE_REMOVE_NODE = 'FILETREE_REMOVE_NODE'
export const removeNode = createAction(FILETREE_REMOVE_NODE, node => node)

export const FILETREE_LOAD_DATA = 'FILETREE_LOAD_DATA'
export const loadNodeData = createAction(FILETREE_LOAD_DATA, (data, node) => ({data, node}))

export function initializeFileTree () {
  return (dispatch, getState) => {
    api.fetchPath('/').then(data => dispatch(loadNodeData(data)))
  }
}
