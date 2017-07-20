import config from 'config'
import minimatch from 'minimatch'
import { reaction } from 'mobx'

function isFileExcluded (filePath) {
  if (filePath === '') return false
  return config.fileExcludePatterns.reduce((isMatched, pattern) => {
    if (isMatched) return true
    return minimatch(filePath, pattern)
  }, false)
}


export default function bindToFile (FileTreeState, FileState, FileTreeNode) {
  function addFileTreeNode (file) {
    if (FileTreeState.entities.has(file.path) || isFileExcluded(file.path)) return null
    return new FileTreeNode({ file })
  }

  function deleteFileTreeNode (file) {
    FileTreeState.entities.delete(file.path)
  }

  FileState.entities.forEach((file) => {
    addFileTreeNode(file)
  })

  const dispose1 = FileState.entities.observe((change) => {
    const { type, newValue, oldValue } = change
    switch (type) {
      case 'add':
        addFileTreeNode(newValue)
        break
      case 'delete':
        deleteFileTreeNode(oldValue)
        break
      default:
    }
  })

  // only react to fileExcludePatterns change
  // observerFunc just uses simple equal comparison, that's why we use `.join()` here
  // if not, we have no way to know if array contents have changed inside
  const dispose2 = reaction(() => config.fileExcludePatterns.join(''), () => {
    FileState.entities.forEach((file) => {
      if (!file) return
      const filePath = file.path
      const fileIsExcluded = isFileExcluded(filePath)

      if (!fileIsExcluded && !FileTreeState.entities.has(filePath)) {
        return addFileTreeNode(file)
      }

      if (fileIsExcluded && FileTreeState.entities.has(filePath)) {
        return deleteFileTreeNode(file)
      }
    })
  })

  return function dispose () {
    dispose1()
    dispose2()
  }
}

