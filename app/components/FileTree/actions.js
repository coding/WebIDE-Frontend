/* @flow weak */
import _ from 'lodash'
import api from '../../api'
import * as TabActions from '../Tab/actions'

export const FILETREE_SELECT_NODE = 'FILETREE_SELECT_NODE'
export function selectNode (node, multiSelect = false) {
  return {
    type: FILETREE_SELECT_NODE,
    node,
    multiSelect
  }
}

export function openNode (node, shoudlBeFolded = null, deep = false) {
  return (dispatch, getState) => {
    if (node.isDir) {
      if (node.shouldBeUpdated) {
        api.fetchPath(node.path)
          .then(data => dispatch(loadNodeData(data, node)))
          .then(() => dispatch(toggleNodeFold(node, shoudlBeFolded, deep)))
      } else {
        dispatch(toggleNodeFold(node, shoudlBeFolded, deep))
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
export function toggleNodeFold (node, shoudlBeFolded = null, deep = false) {
  return {
    type: FILETREE_FOLD_NODE,
    node,
    shoudlBeFolded,
    deep
  }
}

export const FILETREE_REMOVE_NODE = 'FILETREE_REMOVE_NODE'
export function removeNode (node) {
  return {
    type: FILETREE_REMOVE_NODE,
    node
  }
}

export const FILETREE_LOAD_DATA = 'FILETREE_LOAD_DATA'
export function loadNodeData (data, node) {
  return {
    type: FILETREE_LOAD_DATA,
    data,
    node
  }
}

export function initializeFileTree () {
  return (dispatch, getState) => {
    api.fetchPath('/').then(data => dispatch(loadNodeData(data)))
  }
}
