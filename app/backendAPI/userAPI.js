import config from '../config'
import { request } from '../utils'

export function hasCaptcha () {
  return request.get('/login/captcha', null,
    { headers: { Accept: '*/*' } }
  )
}

export function login ({
  password,
  email,
  captcha,
  remember_me
}) {
  return request.post(`/login${location.search ? location.search : '?return_url=/dashboard'}`, {
    password,
    email,
    captcha,
    remember_me
  })
}

// 两部验证
export function loginCode ({
  code
}) {
  return request.post(`/login${location.search ? location.search : '?return_url=/dashboard'}`, {
    code
  })
}

export function signout () {
  return request.get('/logout')
}

export function getUserProfile () {
  // @fixme: initialize2 requires removing .then(res => res.data)
  return request.get('/user/current', null,
    { headers: { Accept: '*/*' } }
  )
}

export function bindQcloud (data) {
  return request.post(`/oauth/qcloud/bind_with_authentication/`, data)
}
