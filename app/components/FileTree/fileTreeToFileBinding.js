const hiddenFolders = ['/.git', '/.coding-ide']

export default function bindToFile (FileTreeState, FileState, FileTreeNode) {
  function addFileTreeNode (file) {
    if (FileTreeState.entities.has(file.path) || hiddenFolders.includes(file.path)) return null
    return new FileTreeNode({ file })
  }

  function deleteFileTreeNode (file) {
    FileTreeState.entities.delete(file.path)
  }

  FileState.entities.forEach((file) => {
    addFileTreeNode(file)
  })

  const dispose = FileState.entities.observe((change) => {
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

  return dispose
}

