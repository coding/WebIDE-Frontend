import { request, qs } from '../utils'

export function fetchPackageHMRModule (packagename, version) {
  return request(`/tty/${config.shardingGroup}/${config.spaceKey}/connect-other-service/packages/${packagename}/${version}`)
}
