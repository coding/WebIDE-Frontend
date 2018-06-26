import * as api from 'backendAPI/projectSettingApi'
import config from 'config'
import { dismissModal } from 'components/Modal/actions'
import FileTreeState from 'components/FileTree/state'
import settings from 'settings'
import { projectState as state } from './state'
import CLASSPATH_TYPE from './constants'

const { CPE_LIBRARY, CPE_SOURCE, CPE_CONTAINER } = CLASSPATH_TYPE
let sourceFolderSlash = []
let libraryFolderSlash = []

const setFolders = function () {
  const { currentResolve } = state
  const sourceFolder = currentResolve.attributes['java.source.folder']
  const libraryFolder = currentResolve.attributes['java.library.folder']
  sourceFolderSlash.forEach((i) => {
    const r = FileTreeState.shrinkPath.directories.remove(i)
  })
  sourceFolderSlash = sourceFolder.map((i) => `/${i}`)
  libraryFolderSlash.forEach((i) => {
    const r = FileTreeState.shrinkPath.directories.remove(i)
  })
  libraryFolderSlash = libraryFolder.map((i) => `/${i}`)
  FileTreeState.shrinkPath.directories = FileTreeState.shrinkPath.directories.concat(sourceFolderSlash).concat(libraryFolderSlash)
  FileTreeState.shrinkPath.enabled = true

  const sourcePath = `/${state.mavenResolve.attributes['java.source.folder']}/`
  config.javaSourcePath = sourcePath
}

export const fetchProjectType = function () {
  api.fetchProjectType().then((res) => {
    state.estimated = res.estimated
    if (res.estimated) {
      state.projectResolve = res.estimations
    } else {
      console.log(res)
      settings.projectsetting.projectType.value = res.type
      settings.projectsetting.sourcePath.value = res.attributes['java.source.folder'][0]
      settings.projectsetting.library.value = res.attributes['java.library.folder'][0]
      state.projectResolve = res
      state.selectedResolve = res.type
      setFolders()
    }
  })
}

export const putProjectType = function (projectConfigDto) {
  return api.putProjectType(projectConfigDto).then((res) => {
    state.selectedResolve = res.type
    // TODO 文件树获取 libs 目录
    // LibTreeActions.getLibs()
    state.estimated = res.estimated
    if (res.estimated) {
      state.projectResolve = res.estimations
    } else {
      if (!res.attributes) {
        res.attributes = {}
      }
      state.projectResolve = res
      setFolders()
    }
    dismissModal()
  })
}

export const fetchClasspath = function () {
  return api.fetchClasspath().then((res) => {
    const libs = []
    const sources = []
    res.map((item) => {
      item.collapsed = true
      if (item.entryKind === CPE_CONTAINER || item.entryKind === CPE_LIBRARY) {
        libs.push(item)
      } else if (item.entryKind === CPE_SOURCE) {
        sources.push(item)
      }
    })
    state.classpath = res
    state.libs = libs
    state.sources = sources
  })
}

export const postClasspath = function (classpath) {
  return api.postClasspath(classpath).then((res) => {
    dismissModal()
    // TODO 文件树获取 libs 目录
    // FileTreeActions.getProjectResolve()
    // LibTreeActions.getLibs()
  })
}
