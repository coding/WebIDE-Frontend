import axios from './axios';

export const getEnablePlugin = () => {
    return axios.get('/user-plugin/enable/list');
}

export const getBuiltinPlugin = () => {
    return axios.get('/packages?requirement=Required');
}

export const getMyPlugin = () => {
    return axios.get('/user-plugin/dev/list?page=0&size=100');
}

export const getPluginTypes = () => {
    return axios.get('/user-plugin/types');
}

export const getPluginInfo = (pluginId) => {
    return axios.get(`/user-plugin/info?pluginId=${pluginId}`);
}

export const modifyPluginInfo = (data) => {
    return axios.put(`/user-plugin/plugin`, data);
}

export const createPlugin = (data) => {
    return axios.post('/user-plugin/create', data);
}

export const uninstallPlugin = (data) => {
    return axios.put('/user-plugin/enable', data);
}

export const updatePluginVersion = (data) => {
    return axios.post('/user-plugin/version', data);
}

export const switchPluginEnable = (data) => {
    return axios.put('/user-plugin/enable', data);
}

export const publishPlugin = (data) => {
    return axios.post('/user-plugin/deploy', data);
}

export const cancelPrePublish = (data) => {
    return axios.post('/user-plugin/pre/deploy/cancel', data);
}
