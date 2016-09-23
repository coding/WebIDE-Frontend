/* @flow weak */
import {readFile, fetchPath} from '../../api'
import * as TabActions from '../Tab/actions'

export const FILETREE_SELECT_NODE = 'FILETREE_SELECT_NODE'
export function selectNode(node, multiSelect=false) {
  return {
    type: FILETREE_SELECT_NODE,
    node: node,
    multiSelect: multiSelect
  }
}


export function openNode(node, shoudlBeFolded=null, deep=false) {
  return (dispatch, getState) => {
    if (node.isDir) {
      fetchPath(node.path)
        .then( data => dispatch(loadNodeData(data)) )
        .then( ()=> dispatch(toggleNodeFold(node, shoudlBeFolded, deep)) );
    } else {
      readFile(node.path)
        .then( data => {
          // get the last active group of type 'editor'
          var lastActiveEditorTabGroup, lastActiveOrder, TabState;

          lastActiveOrder = 0;
          TabState = getState().TabState;
          lastActiveEditorTabGroup = TabState.activeGroup;

          while (lastActiveEditorTabGroup.type != 'editor') {
            lastActiveEditorTabGroup = TabState.activatePrevGroup(--lastActiveOrder);
          }

          dispatch( TabActions.createTabInGroup(lastActiveEditorTabGroup.id, {
            id: _.uniqueId('tab_'),
            title: node.name,
            path: node.path,
            content: {
              body: data.content,
              path: node.path,
              contentType: node.contentType
            }
          }) )
        })
    }
  }
}

export const FILETREE_FOLD_NODE = 'FILETREE_FOLD_NODE'
export function toggleNodeFold(node, shoudlBeFolded=null, deep=false) {
  return {
    type: FILETREE_FOLD_NODE,
    node: node,
    shoudlBeFolded: shoudlBeFolded,
    deep: deep
  }
}


export const FILETREE_LOAD_DATA = 'FILETREE_LOAD_DATA'
export function loadNodeData(data) {
  return {
    type: FILETREE_LOAD_DATA,
    data: data
  }
}

export function initializeFileTree() {
  return (dispatch, getState) => {
    fetchPath('/').then( data => dispatch(loadNodeData(data)) )
  }
}
