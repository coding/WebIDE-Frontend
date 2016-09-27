/* @flow weak */
import store from '../../store'
import { path as pathUtil } from '../../utils'
const { getState, dispatch: $d } = store

import api from '../../api'
import * as Modal from '../../components/Modal/actions'
import * as Git from '../../components/Git/actions'
import * as Tab from '../../components/Tab/actions'

const nodeToNearestDirPath = (node) => {
  if (!node) node = {isDir:true, path:'/'} // fake a root node if !node
  if (node.isDir) {
    var path = node.path
  } else {
    var path = node.parent.path
  }
  return path == '/'? '/' : path + '/'
}

const nodeToParentDirPath = (node) => {
  var pathSplitted = node.path.split('/')
  if (pathSplitted.pop() == '') { pathSplitted.pop() }
  return pathSplitted.join('/')+'/'
}

export default {
  'file:new_file': c => {
    var node = c.context
    var path = nodeToNearestDirPath(node)
    var defaultValue = pathUtil.join(path, 'untitled')

    const createFile = (pathValue) => {
      api.createFile(pathValue)
        .then( _=>$d( Modal.dismissModal() ))
        // if error, try again.
        .catch( err =>
          $d( Modal.updateModal({statusMessage:err.msg}) ).then(createFile)
        )
    }

    $d( Modal.showModal('Prompt', {
        message: 'Enter the path for the new file.',
        defaultValue: defaultValue,
        selectionRange: [path.length, defaultValue.length]
      })
    ).then(createFile)
  },

  'file:save': (c) => {
    var activeTab = getState().TabState.activeGroup.activeTab;
    var content = activeTab.editor.getValue();
    api.writeFile(activeTab.path, content);
  },

  // 'file:delete':
  // 'file:unsaved_files_list':
}
