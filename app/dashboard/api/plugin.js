import axios from './axios';

export const getInstalledPlugin = () => {
    return axios.get('/user-plugin/enable/list', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const createPlugin = (data) => {
    return axios.post('/user-plugin/create', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const updatePluginVersion = (data) => {
    return axios.post('/user-plugin/version', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const switchPluginEnable = (data) => {
    return axios.put('/user-plugin/enable', data, { 'Accept': 'application/vnd.coding.v2+json' });
}
