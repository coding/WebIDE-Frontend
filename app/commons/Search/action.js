import * as api from 'backendAPI/searchAPI'
import state from './state'

function searchUp() {
  if(!state.ws.status) {
    state.ws.name = spaceKey;
    api.searchWorkspaceUp();
  }
}

function searchDown() {
  if(state.ws.status) {
    api.searchWorkspaceDown();
  }
}

function searchStatus() {
  api.searchWorkspaceStatus();
}

function searchString() {
  if(state.ws.status) {
    commonSearch();
    api.searchString(state.searching, state.searched.randomKey);
  }
}

function searchPattern() {
  if(state.ws.status) {
    commonSearch();
    api.searchPattern(state.searching, state.searched.randomKey);
  }
}

function commonSearch() {
  if(!state.searched.end && !state.ws.first) {
    api.searchInterrupt(state.searched.taskId);
  }
  if(state.searched.taskId != null) {
    state.searched.former.taskId = state.searched.taskId
    state.searched.former.results = state.searched.results.splice(0, state.searched.results.length);
    state.searched.taskId = ''
  }
  state.searched.taskId = ''
  state.searched.pattern = state.searching.isPattern
  state.searched.message = ''
  state.searched.end = false
  state.searched.randomKey = randomForOne()
}

function searchInterrupt() {
  if(state.ws.status 
      && !state.searched.end) {
    api.searchInterrupt(state.searched.taskId);
  }
}

function randomForOne() {
  return Math.random().toString(36)
}

export { searchUp, searchDown, searchStatus, searchString, searchPattern, searchInterrupt }