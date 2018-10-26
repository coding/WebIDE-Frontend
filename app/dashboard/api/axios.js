import getCookie from '../utils/cookie';

const baseURL = getCookie('BACKEND_URL') || __BACKEND_URL__ || window.location.origin;
const axios = {};
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/vnd.coding.v1+json',
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
    }).then(res => res.json());
}

axios.post = (url, data, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: parseFormdata(data),
    }).then(res => res.json());
}

axios.put = (url, data, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: parseFormdata(data),
    }).then(res => res.json());
}

axios.delete = (url, data, overrideHeaders = {}) => {
    return fetch(`${baseURL}${url}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: parseFormdata(data),
    }).then(res => res.json());
}

export default axios;
