import * as gitApi from 'backendAPI/gitAPI'

export function gitFileLogs (config) {
  return gitApi.gitLogs(config)
}

export function gitRefs () {
  return gitApi.gitRefs()
}

export function gitFileContentWithRef (params) {
  const { filePath, ref } = params
  return gitApi.gitReadFile({ path: filePath, ref })
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
