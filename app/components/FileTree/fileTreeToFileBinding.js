import config from 'config'
import minimatch from 'minimatch'
import { reaction } from 'mobx'
import is from 'utils/is'

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

  // 1. synchronize file entities and fileTree entities
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

  // 2. only react to fileExcludePatterns change
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

  // 3. handle enableShrinkPath scenario
  const dispose3 = (function shrinkPathEnhancement () {
    function PseudoSet () {
      const set = []
      set.has = function (item) { return this.indexOf(item) !== -1 }
      set.add = function (item) {
        if (is.function(this.onAdd)) this.onAdd(item) // <-- this is NOT intuitive enough though, but it works for now.
        if (!this.has(item)) this.push(item)
        return this
      }
      set.remove = function (item) {
        const indexOfItem = this.indexOf(item)
        if (indexOfItem === -1) return false
        this.splice(indexOfItem, 1)
        return true
      }
      set.delete = function (item) {
        const isRemoved = this.remove(item)
        if (isRemoved && is.function(this.onDelete)) this.onDelete(item)
        return isRemoved
      }
      return set
    }

    function isPathShrinkable (node) {
      if (node.isShadowRoot) return false
      const children = node.children
      if (children.length === 1 && children[0].isDir) return true
      return false
    }

    function getShrinkeeNode (node) {
      const originalNode = node
      function _getShrinkeeNode (self) {
        let targetNode = self
        if (isPathShrinkable(self)) targetNode = self.children[0]
        if (!isPathShrinkable(targetNode)) {
          return targetNode
        } else {
          return _getShrinkeeNode(targetNode)
        }
      }

      const shrinkeeNode = _getShrinkeeNode(node)
      if (shrinkeeNode !== originalNode) {
        shrinkeeNode.provisionalParentId = originalNode.parent.path
        return shrinkeeNode
      }
      return null
    }

    // test if a node is descendents of a dirNode that meets the pattern
    function shouldEnableShrinkPath (node) {
      return FileTreeState.shrinkPath.directories.reduce((passTest, dir) => {
        if (passTest) return true
        return node.path.startsWith(`${dir}/`)
      }, false)
    }

    const getFileTreeNode = (file) => {
      let fileTreeNode = FileTreeState.entities.get(file && is.string(file.path) ? file.path : file)
      if (!fileTreeNode) fileTreeNode = FileTreeState.entities.values().find(node => node.file === file)
      return fileTreeNode
    }

    const shrinkees = new PseudoSet()
    shrinkees.onAdd = function (fileNode) {
      const shrinkeeNode = getFileTreeNode(fileNode)
      shrinkeeNode._parentId = fileNode.provisionalParentId
      delete fileNode.provisionalParentId
    }
    shrinkees.onDelete = function (fileNode) {
      const shrinkeeNode = getFileTreeNode(fileNode)
      if (shrinkeeNode) shrinkeeNode._parentId = undefined
    }

    const shrinkables = new PseudoSet()
    shrinkables.onAdd = function (fileNode) {
      const shrinkableNode = getFileTreeNode(fileNode)
      shrinkableNode.exile()
    }
    shrinkables.onDelete = function (fileNode) {
      const shrinkableNode = getFileTreeNode(fileNode)
      shrinkableNode.welcome()
    }

    return reaction(() =>
      FileTreeState.shrinkPath.enabled && [FileTreeState.entities.values(), FileTreeState.shrinkPath.directories.length]
    , () => {
      if (FileTreeState.shrinkPath.enabled) {
        // 1. each time FileTreeState change, recompute all shrinkable fileNodes,
        // then see if we need to do something
        const _shrinkables = FileState.entities.values().filter(file =>
          shouldEnableShrinkPath(file) && isPathShrinkable(file)
        )
        const _shrinkees = _shrinkables.filter(file =>
          !_shrinkables.includes(file.parent)
        ).map(getShrinkeeNode)

        // 2. now we know all shrinkables and their corresponding shrinkees
        // (which is the last directory child that should expand)

        // we expect `shrinkables` equals `_shrinkables`
        // if a file is in `shrinkables` but NOT in `_shrinkables`
        // that means it should be deleted
        shrinkables.filter(file => !_shrinkables.includes(file)).forEach(file => shrinkables.delete(file))
        _shrinkables.forEach(file => shrinkables.add(file))

        shrinkees.filter(file => !_shrinkees.includes(file)).forEach(file => shrinkees.delete(file))
        _shrinkees.forEach(file => shrinkees.add(file))
        /*
        console.log('[inspect]')
        console.log('shrinkees: ', shrinkees.map(n => n.path))
        console.log('shrinkables: ', shrinkables.map(n => n.path))
        */
      } else {
        while (shrinkees.length) shrinkees.delete(shrinkees[0])
        while (shrinkables.length) shrinkables.delete(shrinkables[0])
      }
    }, {
      delay: 500
    })
  }())

  return function dispose () {
    dispose1()
    dispose2()
    dispose3()
  }
}

