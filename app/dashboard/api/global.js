import axios from './axios';

export const getNotification = () => {
    return axios.get('/workspaces/notification?page=1&pageSize=10');
}

export const markReaded = (data) => {
    return axios.post('/workspaces/notification/mark-read', data);
}

export const getMessage = () => {
    return axios.get('/workspaces/message?page=1&pageSize=10');
}
