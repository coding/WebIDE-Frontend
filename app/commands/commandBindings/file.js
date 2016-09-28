/* @flow weak */
import { bindActionCreators } from 'redux'
import store from '../../store'
const { getState, dispatch } = store
import { path as pathUtil } from '../../utils'
import api from '../../api'
import * as _Modal from '../../components/Modal/actions'
import { notify } from '../../components/Notification/actions'

const Modal = bindActionCreators(_Modal, dispatch)

const nodeToNearestDirPath = (node) => {
  if (!node) node = {isDir:true, path:'/'} // fake a root node if !node
  if (node.isDir) {
    var path = node.path
  } else {
    var path = node.parent.path
  }
  if (path != '/') path += '/'
  return path
}

const nodeToParentDirPath = (node) => {
  var pathSplitted = node.path.split('/')
  if (pathSplitted.pop() == '') { pathSplitted.pop() }
  return pathSplitted.join('/')+'/'
}

export default {
  'file:new_file': (c) => {
    var node = c.context
    var path = nodeToNearestDirPath(node)
    var defaultValue = pathUtil.join(path, 'untitled')

    const createFile = (pathValue) => {
      api.createFile(pathValue)
        .then( () => Modal.dismissModal() )
        // if error, try again.
        .catch(err=>
          Modal.updateModal({statusMessage:err.msg}).then(createFile)
        )
    }

    Modal.showModal('Prompt', {
      message: 'Enter the path for the new file.',
      defaultValue: defaultValue,
      selectionRange: [path.length, defaultValue.length]
    }).then(createFile)
  },


  'file:save': (c) => {
    var activeTab = getState().TabState.activeGroup.activeTab;
    var content = activeTab.editor.getValue();
    api.writeFile(activeTab.path, content);
  },


  'file:rename': (c) => {
    var node = c.context
    var parentPath = nodeToParentDirPath(node)

    const moveFile = (from, newPath, force) => {
      api.moveFile(node.path, newPath, force)
        .then( ()=>Modal.dismissModal() )
        .catch(err=>
          Modal.updateModal({statusMessage:err.msg})
          .then((newPath, force) =>
            moveFile(from, newPath, force)
          )
        )
    }

    Modal.showModal('Prompt', {
      message: 'Enter the new name (or new path) for this file.',
      defaultValue: node.path,
      selectionRange: [parentPath.length, node.path.length]
    }).then(newPath => moveFile(node.path, newPath) )
  },


  'file:delete': async (c) => {
    var confirmed = await Modal.showModal('Confirm', {
      header: 'Are you sure you want to delete this file?',
      message: `You're trying to delete ${c.context.path}`,
      okText: 'Delete'
    })

    if (confirmed) {
      api.deleteFile(c.context.path)
        .then( ()=>dispatch( notify({message:'Delete success!'}) ) )
        .catch(err=>
          dispatch( notify({message:`Delete fail: ${err.msg}`}) )
        )
    }

    Modal.dismissModal()
  }
  // 'file:unsaved_files_list':
}
