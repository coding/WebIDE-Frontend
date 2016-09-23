/* @flow weak */
import _ from 'lodash';
import config from '../../config';

import {
  FILETREE_LOAD_DATA,
  FILETREE_FOLD_NODE,
  FILETREE_SELECT_NODE,
} from './actions';

class Node {
  constructor(nodeInfo) {
    const {
      name, path, isDir, isRoot,
      directoriesCount, filesCount,
      gitStatus, lastModified, lastAccessed,
      contentType
    } = nodeInfo;

    this.name = name;
    this.path = path;
    this.isDir = isDir;
    this.gitStatus = gitStatus;
    this.lastModified = new Date(lastModified);
    this.lastAccessed = new Date(lastAccessed);
    this.contentType = contentType;

    this.isFolded = true;
    this.isFocused = false;
    this.children = [];

    if (isDir) {
      this.directoriesCount = directoriesCount;
      this.filesCount = filesCount;
      this.childrenCount = directoriesCount + filesCount;
    }

    if (isRoot) {
      Node.rootNode = this;
      this.isRoot = isRoot;
      this.isFolded = false;
    }
  }

  findChildNodeByPathComponents(pathComponents) {
    var pathComponent = pathComponents[0];
    var childNode = _.filter(this.children, {name: pathComponent})[0];
    var nextPathComponents = pathComponents.slice(1);
    if (nextPathComponents.length === 0) { return childNode }
    return childNode.findChildNodeByPathComponents(nextPathComponents);
  }
}


const recursivelyBuildNodeByPathComponents = (parentNode, pathComponents, nodeInfo) => {
  const pathComp = pathComponents[0];
  pathComponents = pathComponents.slice(1);

  var childNode = _.filter(parentNode.children, {name: pathComp})[0];
  if (!childNode) {
    const parentPath = (parentNode.isRoot) ? '' : parentNode.path;
    childNode = new Node(nodeInfo);
    childNode.parent = parentNode;
    parentNode.children.push(childNode);
  }
  if (pathComponents.length !== 0) {
    recursivelyBuildNodeByPathComponents(childNode, pathComponents, nodeInfo);
  }
}

const buildFileTree = (rootNode, nodeInfos) => {
  nodeInfos.forEach( nodeInfo => {
    const pathComponents = nodeInfo.path.split('/').slice(1);
    recursivelyBuildNodeByPathComponents(rootNode, pathComponents, nodeInfo);
  });
  return rootNode;
}



const findNodeByPath = (path) => {
  if (path === '/') return Node.rootNode;
  const pathComponents = path.split('/').slice(1);
  return Node.rootNode.findChildNodeByPathComponents(pathComponents);
}

const forEachDescendantNode = (node, handler) => {
  if (!node.isDir) return;
  node.children.forEach( childNode => {
    handler(childNode);
    forEachDescendantNode(childNode, handler)
  });
}

var _state = {};
_state.rootNode = new Node({
  name: '',
  path: '/',
  isDir: true,
  isRoot: true
})

const normalizeState = (_state) => {
  var state = {
    findNodeByPath: findNodeByPath
  };
  state.rootNode = _state.rootNode;
  state.rootNode.name = config.projectName;
  return state;
}



export default function FileTreeReducer (state=_state, action) {
  switch (action.type) {

    case FILETREE_LOAD_DATA:
      state.rootNode = buildFileTree(state.rootNode, action.data);
      return normalizeState(state);

    case FILETREE_SELECT_NODE:
      var {node, multiSelect} = action;
      if (!multiSelect) {
        Node.rootNode.isFocused = false;
        forEachDescendantNode(Node.rootNode, childNode => {
          childNode.isFocused = false;
        });
      }
      node.isFocused = true;
      return normalizeState(state);

    case FILETREE_FOLD_NODE:
      var {node, shoudBeFolded, deep} = action;
      if (!node.isDir) {return state;}
      if (typeof shoudBeFolded === 'boolean') {
        var isFolded = shoudBeFolded;
      } else {
        var isFolded = !node.isFolded;
      }
      node.isFolded = isFolded;
      if (deep) {
        forEachDescendantNode(node, (childNode) => {
          if (childNode.isDir) childNode.isFolded = isFolded;
        });
      }
      return normalizeState(state);


    default:
      return normalizeState(state);
  }
}
