/* @flow weak */
import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import { confirmResize } from './actions'
import TabContainer from '../Tab'
import EditorWrapper from '../EditorWrapper'
import PaneAxis from './PaneAxis'
import ResizeBar from '../ResizeBar'

const _Pane = (props) => {
  const { pane, parentFlexDirection, confirmResize } = props

  const style = { flexGrow: pane.size, display: pane.display }
  return (
    <div id={pane.id}
      style={style}
      className={cx(
        'pane-container',
        parentFlexDirection,
        { resizable: style.flexGrow }
      )}
      data-droppable="PANE"
    > {pane.views.length // priortize `pane.views` over `pane.content`
      ? <PaneAxis pane={pane} />
      : <div className="pane">
          <TabContainer tabGroupId={pane.content.id} containingPaneId={pane.id}
            defaultContentClass={EditorWrapper} defaultContentType="editor"
          />
        </div>
      }
      <ResizeBar viewId={pane.id}
        confirmResize={confirmResize}
        parentFlexDirection={parentFlexDirection} />
    </div>
  )
}

_Pane.propTypes = {
  pane: PropTypes.object,
  parentFlexDirection: PropTypes.string,
}

const Pane = connect(
  (state, { paneId }) => ({ pane: state.PaneState.panes[paneId] }),
  dispatch => bindActionCreators({ confirmResize }, dispatch)
)(_Pane)

export default Pane
