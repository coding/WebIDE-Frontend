/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import {
  GIT_STATUS,
  GIT_BRANCH,
  GIT_CHECKOUT,
  GIT_STAGE_FILE,
  GIT_UNSTAGE_FILE,
  GIT_UPDATE_COMMIT_MESSAGE,
  GIT_CURRENT_BRANCH,
  GIT_UPDATE_STASH_MESSAGE,
  GIT_UPDATE_STASH_LIST,
  GIT_SELECT_STASH,
  GIT_UPDATE_UNSTASH_IS_POP,
  GIT_UPDATE_UNSTASH_IS_REINSTATE,
  GIT_UPDATE_UNSTASH_BRANCH_NAME,
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
  },
  stash: {
    stashMessage: '',
  },
  unstash: {
    stashList: [],
    selectedStash: null,
    isPop: false,
    isReinstate: false,
    newBranchName: '',
  },
}

export default handleActions({
  [GIT_STATUS]: (state, action) => {
    state = _.cloneDeep(state)
    state.workingDir = Object.assign({}, state.workingDir, action.payload)
    return state
  },
  [GIT_UPDATE_COMMIT_MESSAGE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stagingArea.commitMessage = action.payload
    return state
  },
  [GIT_STAGE_FILE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stagingArea.files = _.union(state.stagingArea.files, [action.payload.name])
    return state
  },
  [GIT_UNSTAGE_FILE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stagingArea.files = _.without(state.stagingArea.files, action.payload.name)
    return state
  },
  [GIT_BRANCH]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches = action.payload.branches
    return state
  },
  [GIT_CHECKOUT]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches.current = action.payload.branch
    return state
  },
  [GIT_CURRENT_BRANCH]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches.current = action.payload.name
    return state
  },
  [GIT_UPDATE_STASH_MESSAGE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stash.stashMessage = action.payload
    return state
  },
  [GIT_UPDATE_UNSTASH_IS_POP]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.isPop = action.payload
    return state
  },
  [GIT_UPDATE_UNSTASH_IS_REINSTATE]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.isReinstate = action.payload
    return state
  },
  [GIT_UPDATE_UNSTASH_BRANCH_NAME]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.newBranchName = action.payload
    return state
  },
  [GIT_UPDATE_STASH_LIST]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.stashList = action.payload
    if (state.unstash.stashList.length == 0) {
      state.unstash.selectedStash = null
    } else if(!state.unstash.selectedStash) {
      state.unstash.selectedStash = state.unstash.stashList[0]
    }
    return state
  },
  [GIT_SELECT_STASH]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.selectedStash = action.payload
    return state
  },
}, _state)
