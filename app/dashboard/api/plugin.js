import axios from './axios';

export const getEnablePlugin = () => {
    return axios.get('/user-plugin/enable/list', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const getBuiltinPlugin = () => {
    return axios.get('/packages?requirement=Required', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const getMyPlugin = () => {
    return axios.get('/user-plugin/dev/list', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const getPluginTypes = () => {
    return axios.get('/user-plugin/types', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const getPluginInfo = (pluginId) => {
    return axios.get(`/user-plugin/info?pluginId=${pluginId}`, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const modifyPluginInfo = (data) => {
    return axios.put(`/user-plugin/plugin`, data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const createPlugin = (data) => {
    return axios.post('/user-plugin/create', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const uninstallPlugin = (data) => {
    return axios.put('/user-plugin/enable', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const updatePluginVersion = (data) => {
    return axios.post('/user-plugin/version', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const switchPluginEnable = (data) => {
    return axios.put('/user-plugin/enable', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const publishPlugin = (data) => {
    return axios.post('/user-plugin/deploy', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const cancelPrePublish = (data) => {
    return axios.post('/user-plugin/pre/deploy/cancel', data, { 'Accept': 'application/vnd.coding.v2+json' });
}
