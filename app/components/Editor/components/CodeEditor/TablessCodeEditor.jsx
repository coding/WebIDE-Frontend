import TabStore from 'components/Tab/store'
import BaseCodeEditor from './BaseCodeEditor'
import addMixinMechanism from './addMixinMechanism'

class TablessCodeEditor extends BaseCodeEditor {
  constructor (props, context) {
    super(props, context)
  }
}
addMixinMechanism(TablessCodeEditor, BaseCodeEditor)


TablessCodeEditor.use({
  key: 'tabless',
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
})

export default TablessCodeEditor
