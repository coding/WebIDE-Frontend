import { request } from '../utils'
import config from '../config'

export function defaultEnvList() {
  return request.get(`/tty/${config.spaceKey}/env_list`)
}
