import request from './request';

export const getInstalledPlugin = () => {
    return request.get('/user-plugin/enable/list', { 'Accept': 'application/vnd.coding.v2+json' });
}

export const createPlugin = (data) => {
    return request.post('/user-plugin/create', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const updatePluginVersion = (data) => {
    return request.post('/user-plugin/version', data, { 'Accept': 'application/vnd.coding.v2+json' });
}

export const switchPluginEnable = (data) => {
    return request.put('/user-plugin/enable', data, { 'Accept': 'application/vnd.coding.v2+json' });
}
