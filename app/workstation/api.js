import { request } from '../utils'
import config from '../config'

export function findSpaceKey({ ownerName, projectName }) {
  return request.get(`/ws/find/coding/${ownerName}/${projectName}`, null,
    { headers: { Accept: '*/*' } }
  ).then(res => res.data);
}

export function getDefaultWorkspace() {
  return request.get('/workspaces?default');
}

export function setupWorkspace() {
  return request.post(`/workspaces/${config.spaceKey}`).catch(err => err.response.data);
}

export function setupWorkspace2() {
  return request.post(`/workspaces/${config.spaceKey}`).catch(err => err.response.data);
}

export function getUserProfile() {
  // @fixme: initialize2 requires removing .then(res => res.data)
  return request.get('/user/current', null,
    { headers: { Accept: '*/*' } }
  ).then(res => res);
}

export function fetchRequestState() {
  return request.get(`/workspaces/${config.spaceKey}/collaborator/request`);
}

// Switch back to old version
export function switchVersion() {
  return request.put('/versions')
  .then((res) => {
    window.location.reload();
  });
}

export function fetchProjectType() {
  return request.get(`/ws/${config.spaceKey}/type`)
  .then((res) => {
    config.estimatedMap.replace(res);
  });
}

export function getWorkspaceList() {
  return request.get('/workspaces?page=0&size=5&sort=lastModifiedDate,desc');
}

export function getHardwares() {
  return request.get('/workspaces/hardwares');
}

export function postAdjust(options) {
  return request.post(`/workspaces/${config.spaceKey}/adjust`, options);
}

export function getStaticServingToken() {
  return request.get(`/workspaces/${config.spaceKey}/static_serving_token`);
}
