/* @flow weak */
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import * as PaneActions from './actions'
import TabContainer from '../Tab'
import EditorWrapper from '../EditorWrapper'
import PaneAxis from './PaneAxis'

const _Pane = (props) => {
  const { pane, parentFlexDirection, dispatch } = props
  const { id, views, size, display } = pane

  const style = { flexGrow: size, display }
  return (
    <div id={id}
      style={style}
      className={cx('pane-container', parentFlexDirection)}
      data-droppable="PANE"
    > {views.length > 1
      ? <PaneAxis pane={pane} />
      : <div className="pane">
          <TabContainer tabGroupId={views[0]} containingPaneId={pane.id}
            defaultContentClass={EditorWrapper} defaultContentType="editor"
          />
        </div>}
      <ResizeBar sectionId={id} dispatch={dispatch} parentFlexDirection={parentFlexDirection} />
    </div>
  )
}

_Pane.propTypes = {
  pane: PropTypes.object,
  parentFlexDirection: PropTypes.string,
}

const Pane = connect((state, { paneId }) => ({ pane: state.PaneState.panes[paneId] }))(_Pane)


const ResizeBar = ({ parentFlexDirection, sectionId, dispatch }) => {
  const barClass = (parentFlexDirection === 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)}
      onMouseDown={e => dispatch(PaneActions.startResize(e, sectionId))}
    ></div>
  )
}

export default Pane
