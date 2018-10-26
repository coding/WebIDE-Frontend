import axios from './axios';

export const getUserProfile = () => {
    return axios.get('/user/current');
}

export const getWorkspace = () => {
    return axios.get('/ws/list?page=0&size=100');
}

export const getWorkspaceCollaborative = () => {
    return axios.get('/ws/list?collaborative');
}

export const getWorkspaceLimit = () => {
    return axios.get('/workspaces/workspace-limit', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const getWorkspaceInvalid = () => {
    return axios.get('/workspaces?invalid');
}

export const findProject = ({ ownerName, projectName }) => {
    return axios.get(`/ws/find/coding/${ownerName}/${projectName}`);
}

export const createWorkspace = (data) => {
    return axios.post('/ws/create', data);
}

export const createWorkspaceV2 = (data) => {
    return axios.post('/workspaces', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const cloneWorkspace = (data) => {
    return axios.post('/ws/clone', data);
}

export const deleteWorkspace = (spaceKey) => {
    return axios.delete(`/ws/delete?spaceKey=${spaceKey}`);
}

export const restoreWorkspace = (spaceKey) => {
    return axios.post(`/workspaces/${spaceKey}/restore`);
}

export const getSSHPublicKey = () => {
    return axios.get('/user/public_key');
}

export const logout = () => {
    return axios.get('/logout');
}

export const getCodingProject = () => {
    return axios.get('/projects?page=1&pageSize=1000&type=all&source=Coding');
}

export const getTemplateProject = () => {
    return axios.get('/projects?template=true');
}

export const getEnvList = () => {
    return axios.get(`/tty/common_envs`, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const createProject = (data) => {
    return axios.post('/projects', data);
}

export const syncProject = () => {
    return axios.post('/project/sync', undefined, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const quitWorkspace = (spaceKey) => {
    return axios.post(`/workspaces/${spaceKey}/force_quit`, undefined, { 'X-Space-Key': spaceKey, 'Accept': 'application/vnd.coding.v2+json' });
}
