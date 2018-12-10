import axios from './axios';

export const getUserProfile = () => {
    return axios.get('/user/current', { 'Accept': 'application/vnd.coding.v1+json' });
}

export const getNotification = () => {
    return axios.get('/workspaces/notification?page=1&pageSize=10');
}

export const markReaded = (data) => {
    return axios.post('/workspaces/notification/mark-read', data);
}

export const getMessage = () => {
    return axios.get('/workspaces/message?page=1&pageSize=10');
}
