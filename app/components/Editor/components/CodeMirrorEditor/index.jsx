import React, { Component } from 'react'
import CodeMirror from 'codemirror'
import cx from 'classnames'
import moment from 'moment'
import { autorun } from 'mobx'
import { inject, observer } from 'mobx-react'
import { dispatch } from 'store'
import mtln from 'utils/multiline'
import './addons';
import dispatchCommand from 'commands/dispatchCommand'
import _ from 'lodash'
import * as TabActions from 'components/Tab/actions'

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
    let cmInitialized = false
    // todo add other setting item from config
    if (tab.cm) {
      this.cm = tab.cm
      this.cmContainer.appendChild(this.cm.getWrapperElement())
    } else {
      this.cm = tab.cm = initializeEditor(this.cmContainer, themeName)
      cmInitialized = true
    }
    const cm = this.cm

    if (cmInitialized && tab.path && tab.content) {
      const content = tab.content
      const modeInfo = getMode(tab)
      if (content) cm.setValue(content)
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

  componentWillUnmount () {
    this.cm.off('change', this.onChange)
    this.cm.off('focus', this.onFocus)
    this.dispose()
  }

  renderGitBlameGutter () {
    return autorun('renderGitBlameGutter', () => {
      // set gutter first
      const gutterId = 'git-blame-gutter'
      const gutters = this.cm.options.gutters

      if (!this.props.tab.gitBlame.show) {
        this.cm.clearGutter(gutterId)
        this.cm.setOption('gutters', gutters.filter(id => id !== gutterId))
        this.cm.refresh()
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
    const { tab } = this.props;
    dispatch(TabActions.updateTab({
      id: tab.id,
      flags: { modified: true },
      content: this.cm.getValue()
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
    if (tab.flags.modified || !this.cm || !tab.content) return
    if (tab.content !== this.cm.getValue()) {
      this.cm.setValue(tab.content)
    }

    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.cm.setOption('theme', nextTheme)
  }

  render () {
    const {width, height} = this.props
    const name = this.state.name
    const divStyle = { width, height }
    return (
      <div ref={c => this.cmContainer = c} id={name} style={divStyle}
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

    this.cm = initializeEditor(this.cmContainer, themeName)
    this.cm.focus()
    this.cm.on('change', this.onChange)
  }

  onChange = (e) => {
    dispatch(TabActions.createTabInGroup(this.props.tabGroupId, {
      flags: { modified: true },
      content: this.cm.getValue()
    }))
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
