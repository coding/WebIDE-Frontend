import _ from 'lodash'
import React, { Component } from 'react'
import CodeMirror from 'codemirror'
import cx from 'classnames'
import moment from 'moment'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'
import { defaultProps } from 'utils/decorators'
import mtln from 'utils/multiline'
import dispatchCommand from 'commands/dispatchCommand'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import './addons'

function initializeEditor (cmContainer, theme) {
  // @todo: add other setting item from config
  const cmDOM = document.createElement('div')
  Object.assign(cmDOM.style, { width: '100%', height: '100%' })
  cmContainer.appendChild(cmDOM)
  const cm = CodeMirror(cmDOM, {
    gutters: ['CodeMirror-linenumbers'],
    theme,
    autofocus: true,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
  })

  // 1. resize
  cm.setSize('100%', '100%')

  // 2. prevent default codemirror dragover handler, so the drag-to-split feature can work
  //    but the default handler that open a file on drop is actually pretty neat,
  //    should make our drag feature compatible with it later
  cm.on('dragover', (a, e) => e.preventDefault())

  cm.isFocused = cm.hasFocus // little hack to make codemirror work with legacy interface
  return cm
}

// Ref: codemirror/mode/meta.js
function getMode (file) {
  return CodeMirror.findModeByMIME(file.contentType) || CodeMirror.findModeByFileName(file.path.split('/').pop())
}

const debounced = _.debounce(func => func(), 1000)

@defaultProps(({ tab }) => ({
  editor: tab.editor || null,
  file: tab.editor ? tab.editor.file : null,
}))
@inject(state => ({
  themeName: state.SettingState.settings.theme.syntax_theme.value,
}))
@observer
class CodeMirrorEditor extends Component {
  static defaultProps = {
    theme: 'default',
    height: '100%',
    width: '100%',
  };

  componentDidMount () {
    const { themeName, editor, file } = this.props
    let cmInitialized = false
    // todo add other setting item from config
    if (editor.cm) {
      this.cm = editor.cm
      this.cmContainer.appendChild(this.cm.getWrapperElement())
    } else {
      this.cm = editor.cm = initializeEditor(this.cmContainer, themeName)
      cmInitialized = true
    }
    const cm = this.cm

    if (cmInitialized && file) {
      if (file.content) cm.setValue(file.content)
      const modeInfo = getMode(file)
      if (modeInfo) {
        let mode = modeInfo.mode
        if (mode === 'null') {
          cm.setOption('mode', mode)
        } else {
          require([`codemirror/mode/${mode}/${mode}.js`], () => cm.setOption('mode', mode))
        }
      }
    }

    cm.focus()
    cm.on('change', this.onChange)
    cm.on('focus', this.onFocus)

    this.dispose = this.renderGitBlameGutter()
  }

  renderGitBlameGutter () {
    return autorun('renderGitBlameGutter', () => {
      // set gutter first
      const gutterId = 'git-blame-gutter'
      const gutters = this.cm.options.gutters
      const editor = this.props.editor

      if (!editor.gitBlame.show) {
        this.cm.clearGutter(gutterId)
        this.cm.setOption('gutters', gutters.filter(id => id !== gutterId))
        this.cm.refresh()
        return null
      }

      let gitBlameData = editor.gitBlame.data
      if (!gitBlameData.length) gitBlameData = editor.gitBlame.data = [{
        author: {
          name: "kevenyoung03",
          emailAddress: "kevenyoung03@gmail.com",
          when: 1493889449000
        },
        shortName: "db6c2bf"
      }, {
        author: {
          name: "hackape",
          emailAddress: "kevenyoung03@gmail.com",
          when: 1493889449000
        },
        shortName: "db6c2bf"
      }]

      if (gutters.indexOf(gutterId) === -1) {
        this.cm.setOption('gutters', [...gutters, gutterId])
      }

      gitBlameData.forEach(({ author, shortName: commitHash }, ln) => {
        const fullMessage = mtln`
          commit: ${commitHash}
          time: ${moment(author.when).format('YYYY-MM-DD hh:mm:ss')}
          author: ${author.name}<${author.emailAddress}>`
        const blameText = document.createElement('div')
        blameText.innerHTML = `<div title='${fullMessage}'>${commitHash} ${moment(author.when).format('YYYY-MM-DD')} ${author.name}</div>`
        this.cm.setGutterMarker(ln, 'git-blame-gutter', blameText)
      })

      this.cm.refresh()
    })
  }

  onChange = (e) => {
    if (!this.isChanging) this.isChanging = true
    const { tab, file } = this.props
    FileStore.updateFile({
      id: file.id,
      content: this.cm.getValue(),
    })
    TabStore.updateTab({
      id: tab.id,
      flags: { modified: true },
    })
    if (file) debounced(() => {
      dispatchCommand('file:save')
      this.isChanging = false
    })
  }

  onFocus = () => {
    TabStore.activateTab(this.props.tab.id)
  }

  componentWillReceiveProps ({ tab, themeName }) {
    if (tab.flags.modified || !this.cm || !tab.content) return
    if (tab.content !== this.cm.getValue()) {
      this.cm.setValue(tab.content)
    }

    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.cm.setOption('theme', nextTheme)
  }

  componentWillUnmount () {
    this.cm.off('change', this.onChange)
    this.cm.off('focus', this.onFocus)
    this.dispose()
  }

  render () {
    const { width, height } = this.props
    const divStyle = { width, height }
    return (
      <div ref={c => this.cmContainer = c} style={divStyle}
        className={cx({ 'git-blame-show': this.props.editor.gitBlame.show })}
      />
    )
  }
}


@inject(state => ({
  themeName: state.SettingState.settings.theme.syntax_theme.value,
}))
@observer
class TablessCodeMirrorEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const { themeName, width, height } = this.props

    this.cm = initializeEditor(this.cmContainer, themeName)
    this.cm.focus()
    this.cm.on('change', this.onChange)
  }

  onChange = (e) => {
    TabStore.createTab({
      tabGroup: {
        id: this.props.tabGroupId,
      },
      flags: { modified: true },
      content: this.cm.getValue()
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

export default CodeMirrorEditor
export { TablessCodeMirrorEditor }
