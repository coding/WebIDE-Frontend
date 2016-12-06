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

  const style = { flexGrow: pane.size, display: pane.display }
  return (
    <div id={pane.id}
      style={style}
      className={cx('pane-container', parentFlexDirection)}
      data-droppable="PANE"
    > {pane.views.length // priortize `pane.views` over `pane.content`
      ? <PaneAxis pane={pane} />
      : <div className="pane">
          <TabContainer tabGroupId={pane.content.id} containingPaneId={pane.id}
            defaultContentClass={EditorWrapper} defaultContentType="editor"
          />
        </div>
      }
      <ResizeBar sectionId={pane.id} dispatch={dispatch} parentFlexDirection={parentFlexDirection} />
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
