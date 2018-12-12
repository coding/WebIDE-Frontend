import getCookie from '../utils/cookie';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

const baseURL = getCookie('BACKEND_URL') || __BACKEND_URL__ || window.location.origin;

const axios = {};

const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/vnd.coding.v2+json',
    'X-Requested-With': 'XMLHttpRequest',
};

function parseFormdata(formdata) {
    let str = '';
    for (let key in formdata) {
        if (formdata.hasOwnProperty(key)) {
            str += `&${key}=${formdata[key]}`;
        }
    }
    str = str.slice(1);
    return str;
}

axios.get = (url, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'GET',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
    }).then(res => {
        return res.json();
    }).catch(err => {
        notify({ message: String(err), notifyType: NOTIFY_TYPE.ERROR });
    });
}

axios.post = (url, data, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: parseFormdata(data),
    }).then(res => {
        if (res.status !== 204) {
            return res.json();
        }
    }).catch(err => {
        notify({ message: String(err), notifyType: NOTIFY_TYPE.ERROR });
    });
}

axios.put = (url, data, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: parseFormdata(data),
    }).then(res => {
        return res.json();
    }).catch(err => {
        notify({ message: String(err), notifyType: NOTIFY_TYPE.ERROR });
    });
}

axios.delete = (url, data, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: parseFormdata(data),
    }).then(res => {
        return res.json();
    }).catch(err => {
        notify({ message: String(err), notifyType: NOTIFY_TYPE.ERROR });
    });
}

export default axios;
