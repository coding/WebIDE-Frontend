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
