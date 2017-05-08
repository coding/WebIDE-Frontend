import React, { Component } from 'react'
import CodeMirror from 'codemirror'
import cx from 'classnames'
import moment from 'moment'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'
import { dispatch } from 'store'
import mtln from 'utils/multiline'
import './addons';
import dispatchCommand from '../../commands/dispatchCommand'
import _ from 'lodash'
import * as TabActions from 'commons/Tab/actions'

function initializeEditor (editorContainer, theme) {
  // @todo: add other setting item from config
  const editorDOM = document.createElement('div')
  Object.assign(editorDOM.style, { width: '100%', height: '100%' })
  editorContainer.appendChild(editorDOM)
  const editor = CodeMirror(editorDOM, {
    gutters: ['CodeMirror-linenumbers'],
    theme,
    autofocus: true,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
  })

  // 1. resize
  editor.setSize('100%', '100%')

  // 2. prevent default codemirror dragover handler, so the drag-to-split feature can work
  //    but the default handler that open a file on drop is actually pretty neat,
  //    should make our drag feature compatible with it later
  editor.on('dragover', (a, e) => e.preventDefault())

  editor.isFocused = editor.hasFocus // little hack to make codemirror work with legacy interface
  return editor
}

// Ref: codemirror/mode/meta.js
function getMode (tab) {
  return CodeMirror.findModeByMIME(tab.contentType) || CodeMirror.findModeByFileName(tab.path.split('/').pop())
}

const debounced = _.debounce(func => func(), 1000)

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

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { themeName, tab } = this.props;
    let editorInitialized = false
    // todo add other setting item from config
    if (tab.editor) {
      this.editor = tab.editor
      this.editorContainer.appendChild(this.editor.getWrapperElement())
    } else {
      this.editor = tab.editor = initializeEditor(this.editorContainer, themeName)
      editorInitialized = true
    }
    const editor = this.editor
    // @fixme:
    // related counterparts:
    // 1. IdeEnvironment.js
    // 2. commandBindings/file.js
    window.ide.editors[tab.id] = editor

    if (editorInitialized && tab.path && tab.content) {
      const body = tab.content.body
      const modeInfo = getMode(tab)
      if (body) editor.setValue(body)
      if (modeInfo) {
        let mode = modeInfo.mode
        if (mode === 'null') {
          editor.setOption('mode', mode)
        } else {
          require([`codemirror/mode/${mode}/${mode}.js`], () => editor.setOption('mode', mode))
        }
      }
    }

    editor.focus()
    editor.on('change', this.onChange)
    editor.on('focus', this.onFocus)

    this.dispose = this.renderGitBlameGutter()
  }

  componentWillUnmount () {
    this.editor.off('change', this.onChange)
    this.editor.off('focus', this.onFocus)
    this.dispose()
  }

  renderGitBlameGutter () {
    return autorun('renderGitBlameGutter', () => {
      // set gutter first
      const gutterId = 'git-blame-gutter'
      const gutters = this.editor.options.gutters

      if (!this.props.tab.gitBlame.show) {
        this.editor.clearGutter(gutterId)
        this.editor.setOption('gutters', gutters.filter(id => id !== gutterId))
        this.editor.refresh()
        return null
      }

      let gitBlameData = this.props.tab.gitBlame.data
      if (!gitBlameData.length) gitBlameData = this.props.tab.gitBlame.data = [{
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
        this.editor.setOption('gutters', [...gutters, gutterId])
      }

      gitBlameData.forEach(({ author, shortName: commitHash }, ln) => {
        const fullMessage = mtln`
          commit: ${commitHash}
          time: ${moment(author.when).format('YYYY-MM-DD hh:mm:ss')}
          author: ${author.name}<${author.emailAddress}>`
        const blameText = document.createElement('div')
        blameText.innerHTML = `<div title='${fullMessage}'>${commitHash} ${moment(author.when).format('YYYY-MM-DD')} ${author.name}</div>`
        this.editor.setGutterMarker(ln, 'git-blame-gutter', blameText)
      })

      this.editor.refresh()
    })
  }

  onChange = (e) => {
    if (!this.isChanging) this.isChanging = true
    const { tab } = this.props;
    dispatch(TabActions.updateTab({
      id: tab.id,
      flags: { modified: true },
      content: { body: this.editor.getValue() }
    }))
    if (tab.path) debounced(() => {
      dispatchCommand('file:save')
      this.isChanging = false
    })
  }

  onFocus = () => {
    dispatch(TabActions.activateTab(this.props.tab.id))
  }

  componentWillReceiveProps ({ tab, themeName }) {
    if (tab.flags.modified || !this.editor || !tab.content) return
    if (tab.content.body !== this.editor.getValue()) {
      this.editor.setValue(tab.content.body)
    }

    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.editor.setOption('theme', nextTheme)
  }

  render () {
    const {width, height} = this.props
    const name = this.state.name
    const divStyle = { width, height }
    return (
      <div ref={c => this.editorContainer = c} id={name} style={divStyle}
        className={cx({ 'git-blame-show': this.props.tab.gitBlame.show })}
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

    this.editor = initializeEditor(this.editorContainer, themeName)
    this.editor.focus()
    this.editor.on('change', this.onChange)
  }

  onChange = (e) => {
    dispatch(TabActions.createTabInGroup(this.props.tabGroupId, {
      flags: { modified: true },
      content: this.editor.getValue()
    }))
  }

  componentWillReceiveProps ({ themeName }) {
    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.editor.setOption('theme', nextTheme)
  }

  render () {
    return (
      <div ref={c => this.editorContainer = c} style={{ height: '100%', width: '100%' }} />
    )
  }
}

export default CodeMirrorEditor
export { TablessCodeMirrorEditor }
