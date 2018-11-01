import * as gitApi from 'backendAPI/gitAPI'

export function gitFileLogs (config) {
  return gitApi.gitLogs(config)
}

export function gitRefs () {
  return gitApi.gitRefs()
}

export function gitFileContentWithRef (params) {
  const { filePath, ref } = params
  return new Promise((resolve, reject) => {
    gitApi.gitReadFile({ path: filePath, ref })
      .then((data) => resolve(data.content))
      .catch(reject)
  })
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
