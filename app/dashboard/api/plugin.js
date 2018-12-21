import axios from './axios'

export const getInstalledPlugin = () => axios.get('/user-plugin/install/list')

export const getInstalledDisabledPlugin = () => axios.get('/user-plugin/global_disable/list')

export const getBuiltinPlugin = () => {
  return axios.get('/packages?requirement=Required')
}

export const getMyPlugin = () => axios.get('/user-plugin/dev/list')

export const getPluginTypes = () => axios.get('/user-plugin/types')

export const getPluginInfo = pluginId => axios.get(`/user-plugin/info?pluginId=${pluginId}`)

export const modifyPluginInfo = data => axios.put('/user-plugin/plugin', data)

export const createPlugin = data => axios.post('/user-plugin/create', data)

export const uninstallPlugin = data => axios.put('/user-plugin/enable', data)

export const switchPluginEnable = ({ pluginId, status }) => axios.put(`/user-plugin/enable_status?pluginId=${pluginId}&status=${status}`)

export const updatePluginVersion = data => axios.post('/user-plugin/version', data)

export const publishPlugin = data => axios.post('/user-plugin/deploy', data)

export const cancelPrePublish = data => axios.post('/user-plugin/pre/deploy/cancel', data)

export const deletePlugin = pluginId => axios.delete(`/user-plugin/${pluginId}`)
