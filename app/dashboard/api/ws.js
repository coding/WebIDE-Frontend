import axios from './axios';

export const getUserProfile = () => {
    return axios.get('/user/current', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getWorkspace = () => {
    return axios.get('/ws/list?page=0&size=100', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getWorkspaceCollaborative = () => {
    return axios.get('/ws/list?collaborative', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getWorkspaceLimit = () => {
    return axios.get('/workspaces/workspace-limit');
}

export const getWorkspaceInvalid = () => {
    return axios.get('/workspaces?invalid', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const findProject = ({ ownerName, projectName }) => {
    return axios.get(`/ws/find/coding/${ownerName}/${projectName}`, { 'Accept': 'application/vnd.coding.v1+json' });
}

export const createWorkspace = (data) => {
    return axios.post('/ws/create', data, { 'Accept': 'application/vnd.coding.v1+json' });
}

export const createWorkspaceV2 = (data) => {
    return axios.post('/workspaces', data);
}

export const cloneWorkspace = (data) => {
    return axios.post('/ws/clone', data, { 'Accept': 'application/vnd.coding.v1+json' });
}

export const deleteWorkspace = (spaceKey) => {
    return axios.delete(`/ws/delete?spaceKey=${spaceKey}`, undefined, { 'Accept': 'application/vnd.coding.v1+json' });
}

export const restoreWorkspace = (spaceKey) => {
    return axios.post(`/workspaces/${spaceKey}/restore`, { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getSSHPublicKey = () => {
    return axios.get('/user/public_key', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const logout = () => {
    return axios.get('/logout', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getCodingProject = () => {
    return axios.get('/projects?page=1&pageSize=1000&type=all&source=Coding', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getTemplateProject = () => {
    return axios.get('/projects?template=true', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getEnvList = () => {
    return axios.get(`/tty/common_envs`);
}

export const createProject = (data) => {
    return axios.post('/projects', data, { 'Accept': 'application/vnd.coding.v1+json' });
}

export const syncProject = () => {
    return axios.post('/project/sync');
}

export const quitWorkspace = (spaceKey) => {
    return axios.post(`/workspaces/${spaceKey}/force_quit`, undefined, { 'X-Space-Key': spaceKey });
}
