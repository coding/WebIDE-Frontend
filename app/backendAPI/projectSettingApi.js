import request from 'utils/request'
import config from 'config'

export function fetchProjectType () {
  return request.get(`/ws/${config.spaceKey}/type`)
}

export function putProjectType (projectConfigDto) {
  return request.put(`/ws/${config.spaceKey}/type`, projectConfigDto, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

export function fetchClasspath () {
  return request.get(`/ws/${config.spaceKey}/classpath`)
}

export function postClasspath (classpath) {
  return request.post(`/ws/${config.spaceKey}/classpath`, classpath, {
    headers: {
      'Content-Type': 'application/json',
    }
  })
}
