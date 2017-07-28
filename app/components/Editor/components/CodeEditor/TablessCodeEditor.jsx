import TabStore from 'components/Tab/store'
import BaseCodeEditor from './BaseCodeEditor'

class TablessCodeEditor extends BaseCodeEditor {
  getEventListeners () {
    return {
      change: (cm) => {
        TabStore.createTab({
          flags: { modified: true },
          tabGroup: { id: this.props.tabGroupId },
          editor: {
            content: cm.getValue(),
            cm,
          },
        })
      }
    }
  }

  componentDidMount () {
    super.componentDidMount()
    const eventListeners = this.getEventListeners()
    const disposers = Object.keys(eventListeners).reduce((acc, eventType) => {
      this.cm.on(eventType, eventListeners[eventType])
      return acc.concat(() => this.cm.off(eventType, eventListeners[eventType]))
    }, [])

    this.cmRemoveEventListeners = function cmRemoveEventListeners () {
      disposers.forEach(disposer => disposer())
    }
  }

  componentWillUnmount () {
    this.cmRemoveEventListeners()
    this.editor.destroy()
  }
}

export default TablessCodeEditor
