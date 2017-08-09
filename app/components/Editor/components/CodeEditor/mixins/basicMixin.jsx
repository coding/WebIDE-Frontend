import debounce from 'lodash/debounce'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import dispatchCommand from 'commands/dispatchCommand'

const debounced = debounce(func => func(), 1000)

export default {
  key: 'basic',
  getEventListeners () {
    return {
      change: (cm) => {
        const { editor } = this.props
        // TabStore.updateTab({
        //   id: editor.tab.id,
        //   flags: { modified: true },
        // })
        if (!editor.file) return
        editor.file.isSynced = false
        debounced(() => {
          FileStore.updateFile({
            id: editor.file.id,
            content: cm.getValue(),
          })
          dispatchCommand('file:save')
        })
      },

      focus: () => {
        const { editor } = this.props
        TabStore.activateTab(editor.tab.id)
      },
    }
  },
}
