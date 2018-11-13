import config from './config';

const httpReg = /^http/;

function completeUrl(url) {
    return httpReg.test(url) ? url : `${config.qcloudOrigin}${url}`;
}

export default completeUrl;
