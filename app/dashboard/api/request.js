import config from '../../config';

const request = {};

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.coding.v1+json',
    'X-Requested-With': 'XMLHttpRequest',
}

request.get = (url, overrideHeaders = {}) => {
    return fetch(`${config.baseURL}${url}`, {
        method: 'GET',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
    }).then(res => res.json());
}

request.post = (url, data, overrideHeaders = {}) => {
    return fetch(`${config.baseURL}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: JSON.stringify(data),
    }).then(res => res.json());
}

request.postFormData = (url, formdata, overrideHeaders = {}) => {
    let str = '';
    for (let key in formdata) {
        if (formdata.hasOwnProperty(key)) {
            str += `&${key}=${formdata[key]}`;
        }
    }
    str = str.slice(1);
    return fetch(`${config.baseURL}${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...headers, ...overrideHeaders },
        body: str,
    }).then(res => res.json());
}

request.delete = (url) => {
    return fetch(`${config.baseURL}${url}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
    }).then(res => res.json());
}

export default request;
