/* @flow weak */
import React, { PropTypes } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import { confirmResize } from './actions'
import TabContainer from '../Editor'
import EditorWrapper from '../EditorWrapper'
import PaneAxis from './PaneAxis'
import ResizeBar from '../ResizeBar'


const Pane = observer(props => {
  const { pane, parentFlexDirection } = props
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
          <TabContainer tabGroup={pane.tabGroup} containingPaneId={pane.id} />
        </div>
      }
      <ResizeBar viewId={pane.id}
        confirmResize={confirmResize}
        parentFlexDirection={parentFlexDirection} />
    </div>
  )
})

Pane.propTypes = {
  pane: PropTypes.object,
  parentFlexDirection: PropTypes.string,
}

export default Pane
