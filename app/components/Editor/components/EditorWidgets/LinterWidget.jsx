import React, { Component } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import TooltipTrigger from 'components/Tooltip'

@observer
export default class LinterWidget extends Component {
  render () {
    const editor = this.props.editor
    const lintOptions = editor.options.lint
    const lintError = lintOptions.error
    return (
      <TooltipTrigger
        shouldShow={() => Boolean(lintError)}
        placement='top'
        content={lintError && <span style={{ color: 'red' }}>{lintError.message}</span>}
      >
        <div className='editor-widget'
          onClick={() => lintOptions.retry && lintOptions.retry()}
        >
          <span style={lintError ? { color: 'red' } : {}}
          >ESLint</span>
        </div>
      </TooltipTrigger>
    )
  }
}
