import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import cx from 'classnames'
import { emitter, E } from 'utils'

const debounced = _.debounce(func => func(), 50)
function emitPanelResizedEvent () {
  debounced(() => {
    emitter.emit(E.PANEL_RESIZED)
  })
}

// onloading this module, should make window resize event be heard by emitting `E.PANEL_RESIZED`
window.onresize = emitPanelResizedEvent

function resize (leftViewDom, rightViewDom, dX, dY) {
  if (typeof leftViewDom === 'string') {
    leftViewDom = document.getElementById(leftViewDom)
  }
  if (typeof rightViewDom === 'string') {
    rightViewDom = document.getElementById(rightViewDom)
  }
  let leftSize = Number(leftViewDom.style.flexGrow)
  let rightSize = Number(rightViewDom.style.flexGrow)

  let r, rA, rB
  if (leftViewDom.parentNode.style.flexDirection === 'column') {
    r = dY
    rA = leftViewDom.offsetHeight
    rB = rightViewDom.offsetHeight
  } else {
    r = dX
    rA = leftViewDom.offsetWidth
    rB = rightViewDom.offsetWidth
  }
  if (!rA || !rB) return [leftSize, rightSize]

  leftSize *= (rA - r) / rA
  rightSize *= (rB + r) / rB

  leftViewDom.style.flexGrow = leftSize
  rightViewDom.style.flexGrow = rightSize

  emitPanelResizedEvent()

  return [leftSize, rightSize]
}

function startResize (e, confirmResize) {
  if (e.button !== 0) return // do nothing unless left button pressed
  e.preventDefault()

  const leftViewDom = e.target.previousElementSibling
  const rightViewDom = e.target.nextElementSibling
  if (!rightViewDom) return

  let [oX, oY] = [e.pageX, e.pageY]
  let leftSize = Number(leftViewDom.style.flexGrow)
  let rightSize = Number(rightViewDom.style.flexGrow)

  const handleResize = (e) => {
    const [dX, dY] = [oX - e.pageX, oY - e.pageY]
    ;[oX, oY] = [e.pageX, e.pageY]
    ;[leftSize, rightSize] = resize(leftViewDom, rightViewDom, dX, dY)
  }

  const stopResize = () => {
    window.document.removeEventListener('mousemove', handleResize)
    window.document.removeEventListener('mouseup', stopResize)
    if (confirmResize && typeof confirmResize === 'function') {
      confirmResize(leftViewDom.id, leftSize, rightViewDom.id, rightSize)
    }
  }

  window.document.addEventListener('mousemove', handleResize)
  window.document.addEventListener('mouseup', stopResize)
}

const ResizeBar = ({ parentFlexDirection, confirmResize }) => {
  const barClass = (parentFlexDirection === 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resizeBar', barClass)}
      onMouseDown={e => startResize(e, confirmResize)}
    />
  )
}

ResizeBar.propTypes = {
  parentFlexDirection: PropTypes.string.isRequired,
  confirmResize: PropTypes.func,
}

export default ResizeBar
