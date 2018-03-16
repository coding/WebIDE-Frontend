import config from '../config'
import { request } from '../utils'

export function hasCaptcha () {
  return request.get('/login/captcha')
}

export function login ({
  password,
  email,
  captcha,
  remember_me
}) {
  return request.post(`/login${location.search ? location.search : '?return_url=/ws/default'}`, {
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
  return request.post(`/login${location.search ? location.search : '?return_url=/ws/default'}`, {
    code
  })
}
