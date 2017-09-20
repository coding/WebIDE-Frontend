import React from 'react'
import { observer } from 'mobx-react'
import cx from 'classnames'
import state from './state'

const Tooltip = observer(({ placement, rect, content, show }) => {
  let x, y
  switch (placement) {
    case 'top':
      x = rect.left + rect.width / 2
      y = rect.top
      break
    case 'bottom':
      x = rect.left + rect.width / 2
      y = rect.bottom
      break
    case 'left':
      x = rect.left
      y = rect.top + rect.height / 2
      break
    case 'right':
      x = rect.right
      y = rect.top + rect.height / 2
      break
  }
  return (
    <div className={cx('tooltip-anchor', placement, { show })}
      style={{ left: x + 'px', top: y + 'px' }} >
      <div className={cx('tooltip-content', placement)}>{content}</div>
    </div>
  )
})


const Tooltips = observer(() => (
  <div style={{ color: 'red' }}>
    {state.entities.map(tooltip => <Tooltip key={tooltip} {...tooltip} />)}
  </div>
))

export default Tooltips
