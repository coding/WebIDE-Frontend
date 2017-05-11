import { autorun } from 'mobx'

export default function bindToFile (FileState, FileTreeNode) {
  autorun('bind File to FileTree', () => {
    FileState.entities.forEach(fileNode => {
      if (!fileNode) return
      if (fileNode.tree instanceof FileTreeNode) {
        return fileNode.tree
      } else {
        const fileTreeNode = new FileTreeNode({ file: fileNode })
      }
    })
  })
}
