import request from './utils/request';
import messageClient from './utils/message-client';
import messageSubscription from './utils/message-subscription';
import config from './config';

export function fetchPath(path, other, group) {
  return request.get(`/workspaces/${config.spaceKey}/files`, {
    path: path,
    other: true,
    group: true
  });
}

export function writeFile(path, content, base64) {
  return request({
    method: 'PUT',
    url: `/workspaces/${config.spaceKey}/files`,
    form: {
      path: path,
      content: content,
      base64: base64 || false,
      override: true,
      createParent: true,
    }
  })
}

export function readFile(path) {
  return request.get(`/workspaces/${config.spaceKey}/file/read`, {
    path: path,
    base64: false,
  });
}

export function createFile(path) {
  return request({
    method: 'PUT',
    url: `/workspaces/${config.spaceKey}/files`,
    form: {
      path: path,
      content: content,
      base64: base64 || false,
      override: true,
      createParent: true,
    }
  })
}


export function setupWorkspace() {
  return request.post(`/workspaces/${config.spaceKey}/setup`).then( ({spaceKey, projectName, projectIconUrl}) => {
    // 1.
    var websocketPromise = new Promise(function(resolve, reject) {
      messageClient.connect(function() {
        messageSubscription.call(this);
        resolve(true);
      });
    })

    // 2.
    var settingsPromise = request.get(`/workspaces/${config.spaceKey}/settings`).then( ({content}) => {
      return JSON.parse(content);
    })

    return Promise.all([websocketPromise, settingsPromise]).then( ([isConnected, settings])=> {
      return {
        projectName,
        spaceKey,
        projectIconUrl,
        settings
      }
    })

  })
}


export function gitStatus() {
  return request.get(`/git/${config.spaceKey}`)
}

export function gitBranch() {
  return request.get(`/git/${config.spaceKey}/branches`)
}

export function gitCheckout(branch, remoteBranch) {
  return request.post(`/git/${config.spaceKey}/checkout`, {
    name:branch, startPoint:remoteBranch
  })
}

export function gitCommit({files, message}) {
  return request.post(`/git/${config.spaceKey}`, {files, message})
}

export function gitPull() {
  return request.post(`/git/${config.spaceKey}/pull`)
}

export function gitPushAll() {
  return request.post(`/git/${config.spaceKey}/push?all=true`).then(res => {
    if (res.ok || res.nothingToPush) return true;
    if (!res.ok) return false;
  })
}


export function getWorkspaces() {
  return request.get(`/workspaces`)
}

export function createWorkspace(url) {
  return request.post('/workspaces', {url})
}

export function deleteWorkspace(spaceKey) {
  return request.delete(`/workspaces/${spaceKey}`)
}

export function getPublicKey() {
  return request.get('/user?public_key');
}
