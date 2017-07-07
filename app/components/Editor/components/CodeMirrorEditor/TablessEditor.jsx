import React from 'react'
import CodeMirrorEditor from './CodeMirrorEditor'

const TablessEditor = CodeMirrorEditor.extends(function () {
  return {
    constructor () {
      this.state = {}
    },

    onChange: (e) => {
      TabStore.createTab({
        flags: { modified: true },
        tabGroup: {
          id: this.props.tabGroupId,
        },
        editor: {
          content: this.cm.getValue(),
          cm: this.cm,
        },
      })
    },
  }
})

export default TablessEditor

class TablessCodeMirrorEditor2 extends BaseCodeMirrorEditor {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { themeName, width, height } = this.props

    this.cm = initializeEditor(this.cmContainer, themeName)
    this.cm.focus()
    this.cm.on('change', this.onChange)
  }

  componentWillUnmount () {
    this.cm.off('change', this.onChange)
  }

  onChange = (e) => {
    TabStore.createTab({
      flags: { modified: true },
      tabGroup: {
        id: this.props.tabGroupId,
      },
      editor: {
        content: this.cm.getValue(),
        cm: this.cm,
      },
    })
  }

  componentWillReceiveProps ({ themeName }) {
    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.cm.setOption('theme', nextTheme)
  }

  render () {
    return (
      <div ref={c => this.cmContainer = c} style={{ height: '100%', width: '100%' }} />
    )
  }
}

