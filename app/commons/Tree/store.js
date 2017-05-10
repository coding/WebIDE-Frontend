import { registerAction } from 'utils/actions'
import api from 'backendAPI'

const selectNode = registerAction('FILETREE_SELECT_NODE',
  (nodeOrOffset, multiSelect) => ({ nodeOrOffset, multiSelect }),
  ({ nodeOrOffset, multiSelect=false }) => {
    let offset, node
    if (typeof nodeOrOffset === 'number') {
      offset = nodeOrOffset
    } else {
      node = nodeOrOffset
    }

    if (offset === 1) {
      node = state.focusedNodes[0].next(true)
    } else if (offset === -1) {
      node = state.focusedNodes[0].prev(true)
    }

    if (!multiSelect) {
      state.root.unfocus()
      state.root.forEachDescendant(childNode => childNode.unfocus())
    }

    node.focus()
  }
)

const openNode = registerAction('open_node',
  (node, shouldBeFolded, deep) => ({ node, shouldBeFolded, deep }),
  ({ node, shouldBeFolded=null, deep=false }) => {

  }
)

