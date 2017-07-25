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
        if (!this.isChanging) this.isChanging = true
        const { tab, editor } = this.props
        TabStore.updateTab({
          id: tab.id,
          flags: { modified: true },
        })

        if (editor.file) debounced(() => {
          FileStore.updateFile({
            id: editor.file.id,
            content: cm.getValue(),
          })
          dispatchCommand('file:save')
          this.isChanging = false
        })
      },

      focus: () => {
        TabStore.activateTab(this.props.tab.id)
      },
    }
  },
}
