import { autorun } from 'mobx'

const hiddenFolders = ['/.git', '/.coding-ide']
export default function bindToFile (FileTreeState, FileState, FileTreeNode) {
  autorun('bind File to FileTree', () => {
    FileState.entities.forEach(fileNode => {
      if (!fileNode) return
      const isFileTreeNodeExist = FileTreeState.entities.has(fileNode.path)
      const isHiddenFile = hiddenFolders.includes(fileNode.path)
      if (!isFileTreeNodeExist && !isHiddenFile) {
        return new FileTreeNode({ file: fileNode })
      }
    })
  })
}

