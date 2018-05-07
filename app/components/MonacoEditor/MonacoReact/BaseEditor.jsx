import React from 'react'
import PropTypes from 'prop-types'
import { measure } from '@pinyin/measure'

// import * as monaco from 'monaco-editor'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands'
import 'monaco-editor/esm/vs/editor/contrib/find/findController'

self.MonacoEnvironment = {
  getWorkerUrl (moduleId, label) {
    // if (label === 'json') {
    //   return './json.worker.bundle.js'
    // }
    // if (label === 'css') {
    //   return './css.worker.bundle.js'
    // }
    // if (label === 'html') {
    //   return './html.worker.bundle.js'
    // }
    // if (label === 'typescript' || label === 'javascript') {
    //   return './ts.worker.bundle.js'
    // }
    return './editor.worker.bundle.js'
  }
}

// import 'monaco-editor/esm/vs/editor/edcore.main'
// import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

function noop () {}

const Div = measure('div')

class MonacoEditor extends React.Component {
  constructor (props) {
    super(props)
    this.containerElement = undefined
    this.currentValue = props.value

    if (props.language === 'javascript') {
      require('monaco-editor/esm/vs/language/typescript/monaco.contribution')
    } else if (props.language === 'css') {
      require('monaco-editor/esm/vs/language/css/monaco.contribution')
      require('monaco-editor/esm/vs/basic-languages/css/css.contribution')
    } else {
      require(`monaco-editor/esm/vs/basic-languages/${props.language}/${
        props.language
      }.contribution`)
    }
  }

  componentDidMount () {
    this.afterViewInit()

    if (this.editor) {
      window.addEventListener('resize', this.handleResize)
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.value !== this.currentValue) {
      // Always refer to the latest value
      this.currentValue = this.props.value
      // Consider the situation of rendering 1+ times before the editor mounted
      if (this.editor) {
        this.__prevent_trigger_change_event = true
        this.editor.setValue(this.currentValue)
        this.__prevent_trigger_change_event = false
      }
    }
    if (prevProps.language !== this.props.language) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language)
    }
    if (prevProps.theme !== this.props.theme) {
      monaco.editor.setTheme(this.props.theme)
    }
    if (
      this.editor &&
      (this.props.width !== prevProps.width || this.props.height !== prevProps.height)
    ) {
      this.editor.layout()
    }
  }

  componentWillUnmount () {
    this.destroyMonaco()
  }

  handleResize = () => {
    if (!this.editor) return
    this.editor.layout()
  }

  editorWillMount () {
    const { editorWillMount } = this.props
    editorWillMount(monaco)
  }

  editorDidMount (editor) {
    this.props.editorDidMount(editor, monaco)
    editor.onDidChangeModelContent((event) => {
      const value = editor.getValue()

      // Always refer to the latest value
      this.currentValue = value

      // Only invoking when user input changed
      if (!this.__prevent_trigger_change_event) {
        this.props.onChange(value, event)
      }
    })
  }

  afterViewInit = () => {
    const context = this.props.context || window
    if (monaco !== undefined) {
      this.initMonaco()
      return
    }
    const { requireConfig } = this.props

    const loaderUrl = requireConfig.url || 'vs/loader.js'

    const onGotAmdLoader = () => {
      if (context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
        if (requireConfig.paths && requireConfig.paths.vs) {
          // will need to switch to nodeRequire here
          context.require.config(requireConfig)
        }
      }

      // Load monaco
      if (context.require) {
        context.require(['vs/editor/editor.main'], () => {
          this.initMonaco()
        })
      }

      // Call the delayed callbacks when AMD loader has been loaded
      if (context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
        context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__ = false
        const loaderCallbacks = context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__

        if (loaderCallbacks && loaderCallbacks.length) {
          let currentCallback = loaderCallbacks.shift()

          while (currentCallback) {
            currentCallback.fn.call(currentCallback.context)
            currentCallback = loaderCallbacks.shift()
          }
        }
      }
    }

    // Load AMD loader if necessary
    if (context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__) {
      // We need to avoid loading multiple loader.js when there are multiple editors loading
      // concurrently, delay to call callbacks except the first one
      // eslint-disable-next-line max-len
      context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__ =
        context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__ || []
      context.__REACT_MONACO_EDITOR_LOADER_CALLBACKS__.push({
        context: this,
        fn: onGotAmdLoader
      })
    } else if (typeof context.require === 'undefined') {
      const loaderScript = context.document.createElement('script')
      loaderScript.type = 'text/javascript'
      loaderScript.src = loaderUrl
      loaderScript.addEventListener('load', onGotAmdLoader)
      context.document.body.appendChild(loaderScript)
      context.__REACT_MONACO_EDITOR_LOADER_ISPENDING__ = true
    } else {
      onGotAmdLoader()
    }
  }

  initMonaco () {
    const value = this.props.value !== null ? this.props.value : this.props.defaultValue
    const { language, theme, options } = this.props
    if (this.containerElement && typeof monaco !== 'undefined') {
      // Before initializing monaco editor
      this.editorWillMount(monaco)
      this.editor = monaco.editor.create(this.containerElement, {
        value,
        language,
        theme: theme || 'vs-dark',
        ...options
      })
      // After initializing monaco editor
      this.editorDidMount(this.editor)
    }
  }

  destroyMonaco () {
    if (typeof this.editor !== 'undefined') {
      this.editor.dispose()
    }
  }

  assignRef = (component) => {
    this.containerElement = component
  }

  render () {
    const { width, height } = this.props
    const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`
    const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`
    const style = {
      width: fixedWidth,
      height: fixedHeight
    }

    return (<Div
      style={{ width: '100%', height: '100%' }}
      onWidthChange={this.handleResize}
      onHeightChange={this.handleResize}
    >
      <div className='react-monaco-editor-container' ref={this.assignRef} style={style} />
    </Div>)
  }
}

MonacoEditor.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  language: PropTypes.string,
  theme: PropTypes.string,
  options: PropTypes.object,
  editorDidMount: PropTypes.func,
  editorWillMount: PropTypes.func,
  onChange: PropTypes.func,
  requireConfig: PropTypes.object,
  context: PropTypes.object // eslint-disable-line react/require-default-props
}

MonacoEditor.defaultProps = {
  width: '100%',
  height: '100%',
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: null,
  options: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop,
  requireConfig: {}
}

export default MonacoEditor
