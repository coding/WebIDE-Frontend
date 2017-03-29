/* @flow weak */
import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import { emitter } from 'utils'

const getNextSiblingNode = (currentDOM) => {
  let sibling = currentDOM.nextSibling
  if (sibling) {
    while (sibling.nodeName !== currentDOM.nodeName) {
      sibling = sibling.nextSibing
      if (!sibling) break
    }
  }
 return sibling
}

const startResize = (e, viewId, confirmResize) => {
  if (e.button !== 0) return // do nothing unless left button pressed
  e.preventDefault()

  let leftViewDom = document.getElementById(viewId)
  let rightViewDom = getNextSiblingNode(leftViewDom)
  if (!rightViewDom) return

  let [oX, oY] = [e.pageX, e.pageY]
  let [leftSize, rightSize] = [Number(leftViewDom.style.flexGrow), Number(rightViewDom.style.flexGrow)]
  // if (!leftSize || !rightSize) console.log('bommer', typeof rightSize); return

  const handleResize = (e) => {
    let [dX, dY] = [oX - e.pageX, oY - e.pageY]
    ;[oX, oY] = [e.pageX, e.pageY]
    ;[leftSize, rightSize] = resize(leftViewDom.id, rightViewDom.id, dX, dY)
    // Array.isArray(resizingListeners) && resizingListeners.forEach(listener => listener())
  }

  const stopResize = () => {
    window.document.removeEventListener('mousemove', handleResize)
    window.document.removeEventListener('mouseup', stopResize)
    confirmResize(leftViewDom.id, leftSize, rightViewDom.id, rightSize)
  }

  window.document.addEventListener('mousemove', handleResize)
  window.document.addEventListener('mouseup', stopResize)
}

const debounced = _.debounce(func => func(), 50)
const resize = (leftViewId, rightViewId, dX, dY) => {
  let leftViewDom = document.getElementById(leftViewId)
  let rightViewDom = document.getElementById(rightViewId)
  let [leftSize, rightSize] = [Number(leftViewDom.style.flexGrow), Number(rightViewDom.style.flexGrow)]

  var r, rA, rB
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

  debounced(() => {
    emitter.emit('panel_resized')
  })

  return [leftSize, rightSize]
}

const ResizeBar = ({ parentFlexDirection, viewId, confirmResize }) => {
  const barClass = (parentFlexDirection === 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)}
      onMouseDown={e => startResize(e, viewId, confirmResize)}
    ></div>
  )
}

ResizeBar.propTypes = {
  parentFlexDirection: PropTypes.string.isRequired,
  viewId: PropTypes.string.isRequired,
  confirmResize: PropTypes.func.isRequired,
}

export default ResizeBar
