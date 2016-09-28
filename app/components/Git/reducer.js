/* @flow weak */
import _ from 'lodash'

import {
  GIT_STATUS,
  GIT_BRANCH,
  GIT_CHECKOUT,
  GIT_STAGE_FILE,
  GIT_UNSTAGE_FILE,
  GIT_UPDATE_COMMIT_MESSAGE
} from './actions'

const _state = {
  workingDir: {
    isClean: true,
    files: []
  },
  stagingArea: {
    files: [],
    commitMessage: ''
  },
  branches: {
    current: 'master'
  }
}

export default function GitReducer (state = _state, action) {
  state = _.cloneDeep(state)
  switch (action.type) {

    case GIT_STATUS:
      var workingDirDelta = {
        isClean: action.isClean,
        files: action.files
      }
      state.workingDir = Object.assign({}, state.workingDir, workingDirDelta)
      return state

    case GIT_UPDATE_COMMIT_MESSAGE:
      state.stagingArea.commitMessage = action.commitMessage
      return state

    case GIT_STAGE_FILE:
      state.stagingArea.files = _.union(state.stagingArea.files, [action.fileName])
      return state

    case GIT_UNSTAGE_FILE:
      state.stagingArea.files = _.without(state.stagingArea.files, action.fileName)
      return state

    case GIT_BRANCH:
      state.branches = action.branches
      return state

    case GIT_CHECKOUT:
      state.branches.current = action.branch
      return state

    default:
      return state
  }
}
