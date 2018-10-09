import * as gitApi from 'backendAPI/gitAPI'

export function gitFileLogs (config) {
  return gitApi.gitLogs(config)
}

export function gitRefs () {
  return gitApi.gitRefs()
}

export function gitFileContentWithRef (params) {
  return gitApi.gitReadFile(params)
}

export function gitFileDiffWithRef (params) {
  return gitApi.gitFileDiff(params)
}

export function gitCommitDiff (params) {
  return gitApi.gitCommitDiff(params)
}

export function gitBlame (path) {
  return gitApi.gitBlame(path)
}
