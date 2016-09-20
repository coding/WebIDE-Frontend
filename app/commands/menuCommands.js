import * as api from '../api';
import store from '../store';
import * as ModalActions from '../components/Modal/actions';
import * as GitActions from '../components/Git/actions';
import * as TabActions from '../components/Tab/actions';
import { bindActionCreators } from 'redux';
const {getState, dispatch} = store;

const [Modal, Git, Tab] = [
  ModalActions,
  GitActions,
  TabActions
].map( Actions => bindActionCreators(Actions, dispatch) );

export default {
  // 'app:settings':
  'file:new_file': c => {
    var node = c.context
    if (node.isDir) {
      var path = node.path
    } else {
      var path = node.parent.path
    }
    if (path !== '/') path += '/'
    var defaultValue = path + 'untitled'

    const createFile = (pathValue) => {
      console.log('called');
      api.createFile(pathValue)
        .then(Modal.dismissModal)
        // if error, try again.
        .catch(errMsg =>
          Modal.updateModal({statusMessage:errMsg}).then(createFile)
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

  'git:commit': (c) => {
    api.gitStatus().then( ({files, clean}) => {
      Git.updateStatus({files, isClean: clean})
    }).then( () =>
      Modal.showModal('GitCommit', 'HelloYo')
    )
  },

  'modal:dismiss': (c) => {
    Modal.dismissModal()
  },
  // 'file:delete':
  // 'file:unsaved_files_list':
  // 'view:close_tab':
  // 'view:toggle_statusbar':
  // 'view:toggle_filetree':

  // 'tools:terminal:clear_buffer':
  // 'tools:terminal:clear_scrollback_buffer':
  // 'tools:terminal:reset':
  'tools:terminal:new_terminal': (c) => {

  },

  // 'git:commit_and_push':
  'git:pull': (c) => {
    Git.pull()
  },

  'git:push': (c) => {
    Git.push()
  },

  // 'git:branch':
  // 'git:tag':
  // 'git:merge':
  // 'git:resolve_conflicts':
  // 'git:stash':
  // 'git:unstash'<:></:>
  // 'git:reset_head':
  // 'git:rebase:start':
  // 'git:rebase:abort':
  // 'git:rebase:continue':
  // 'git:rebase:skip_commit':
}
