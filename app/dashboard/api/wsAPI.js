import request from './request';

export const getUserProfile = () => {
    return request.get('/user/current');
}

export const getWorkspace = () => {
    return request.get('/ws/list?page=0&size=100');
}

export const getWorkspaceCollaborative = () => {
    return request.get('/ws/list?collaborative');
}

export const getWorkspaceLimit = () => {
    return request.get('/workspaces/workspace-limit', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const getWorkspaceInvalid = () => {
    return request.get('/workspaces?invalid');
}

export const findProject = ({ ownerName, projectName }) => {
    return request.get(`/ws/find/coding/${ownerName}/${projectName}`);
}

export const createWorkspace = (data) => {
    return request.postFormData('/ws/create', data, { 'Content-Type': 'application/x-www-form-urlencoded' });
}

export const createWorkspaceV2 = (data) => {
    return request.postFormData('/workspaces', data, { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/vnd.coding.v2+json' });
}

export const cloneWorkspace = (data) => {
    return request.postFormData('/ws/clone', data, { 'Content-Type': 'application/x-www-form-urlencoded' });
}

export const deleteWorkspace = (spaceKey) => {
    return request.delete(`/ws/delete?spaceKey=${spaceKey}`);
}

export const restoreWorkspace = (spaceKey) => {
    return request.post(`/workspaces/${spaceKey}/restore`);
}

export const getSSHPublicKey = () => {
    return request.get('/user/public_key');
}

export const logout = () => {
    return request.get('/logout');
}

export const getCodingProject = () => {
    return request.get('/projects?page=1&pageSize=1000&type=all&source=Coding');
}

export const getTemplateProject = () => {
    return request.get('/projects?template=true');
}

export const getEnvList = () => {
    return request.get(`/tty/common_envs`, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const createProject = (data) => {
    return request.postFormData('/projects', data, { 'Content-Type': 'application/x-www-form-urlencoded' });
}

export const syncProject = () => {
    return request.post('/project/sync', undefined, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const quitWorkspace = (spaceKey) => {
    return request.post(`/workspaces/${spaceKey}/force_quit`, undefined, { 'X-Space-Key': spaceKey, 'Accept': 'application/vnd.coding.v2+json' });
}
