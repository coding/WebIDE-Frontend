import axios from './axios';

export const getInstalledPlugin = () => {
    return axios.get('/user-plugin/install/list');
}

export const getInstalledDisabledPlugin = () => {
    return axios.get('/user-plugin/global_disable/list');
}

export const getBuiltinPlugin = () => {
    return axios.get('/packages?requirement=Required');
}

export const getMyPlugin = () => {
    return axios.get('/user-plugin/dev/list');
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

export const switchPluginEnable = ({ pluginId, status }) => {
    return axios.put(`/user-plugin/enable_status?pluginId=${pluginId}&status=${status}`);
}

export const updatePluginVersion = (data) => {
    return axios.post('/user-plugin/version', data);
}

export const publishPlugin = (data) => {
    return axios.post('/user-plugin/deploy', data);
}

export const cancelPrePublish = (data) => {
    return axios.post('/user-plugin/pre/deploy/cancel', data);
}

export const deletePlugin = (pluginId) => {
    return axios.delete(`/user-plugin/${pluginId}`);
}
