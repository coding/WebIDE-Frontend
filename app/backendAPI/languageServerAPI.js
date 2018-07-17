import { request } from 'utils'
import config from 'config'

export function fetchLanguageServerSetting (spaceKey) {
  return request.get(`/settings/${spaceKey}/language`)
}

export function setLanguageServerOne ({ type, srcPath }) {
  return request.put(`/settings/${config.spaceKey}/language/one`, { type, srcPath })
}
