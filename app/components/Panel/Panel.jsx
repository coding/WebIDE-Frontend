import React, { PropTypes } from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import PanelAxis from './PanelAxis'
import PanelContent from './PanelContent'
import { confirmResize } from './actions'
import ResizeBar from '../ResizeBar'

const Panel = observer((props) => {
  const { panel, parentFlexDirection } = props
  const style = {}
  if (panel.resizable) {
    style.flexGrow = panel.size
  } else {
    style.flexGrow = 0
    style.flexBasis = 'auto'
  }
  if (panel.hidden) style.display = 'none'
  if (panel.disabled) style.display = 'none'
  if (panel.overflow) style.overflow = panel.overflow

  return (
    <div id={panel.id}
      style={style}
      className={cx(
        'panel-container',
        parentFlexDirection,
        { resizable: style.flexGrow }
      )}
    > { panel.views.length
        ? <PanelAxis panel={panel} />
        : <div className='panel'><PanelContent panel={panel} /></div>
      }
      {panel.disableResizeBar
        ? null
        : <ResizeBar viewId={panel.id}
          confirmResize={confirmResize}
          parentFlexDirection={parentFlexDirection} />
      }
    </div>
  )
})

Panel.propTypes = {
  panel: PropTypes.object.isRequired,
  parentFlexDirection: PropTypes.string.isRequired,
}

export default Panel
