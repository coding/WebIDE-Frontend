import _extends from 'babel-runtime/helpers/extends'
import React from 'react'
import './index.css'
import Notification from 'rc-notification'

const notificationInstance = {}
let defaultDuration = 4.5
let defaultTop = 24
let defaultBottom = 24
let defaultPlacement = 'topRight'
let defaultGetContainer = void 0

function setNotificationConfig (options) {
  let duration = options.duration,
    placement = options.placement,
    bottom = options.bottom,
    top = options.top,
    getContainer = options.getContainer

  if (duration !== undefined) {
    defaultDuration = duration
  }
  if (placement !== undefined) {
    defaultPlacement = placement
  }
  if (bottom !== undefined) {
    defaultBottom = bottom
  }
  if (top !== undefined) {
    defaultTop = top
  }
  if (getContainer !== undefined) {
    defaultGetContainer = getContainer
  }
}
function getPlacementStyle (placement) {
  let style = void 0
  switch (placement) {
    case 'topLeft':
      style = {
        left: 0,
        top: defaultTop,
        bottom: 'auto'
      }
      break
    case 'topRight':
      style = {
        right: 0,
        top: defaultTop,
        bottom: 'auto'
      }
      break
    case 'bottomLeft':
      style = {
        left: 0,
        top: 'auto',
        bottom: defaultBottom
      }
      break
    default:
      style = {
        right: 0,
        top: 'auto',
        bottom: defaultBottom
      }
      break
  }
  return style
}

function getNotificationInstance (prefixCls, placement) {
  const cacheKey = `${prefixCls}-${placement}`
  if (!notificationInstance[cacheKey]) {
    notificationInstance[cacheKey] = Notification.newInstance({
      prefixCls,
      className: `${prefixCls}-${placement}`,
      style: getPlacementStyle(placement),
      getContainer: defaultGetContainer
    })
  }
  return notificationInstance[cacheKey]
}

const typeToIcon = {
  success: { className: 'fa fa-check-circle', color: '#00a854' },
  info: { className: 'fa fa-info-circle', color: '#108ee9' },
  error: { className: 'fa fa-times-circle', color: '#f04134' },
  warning: { className: 'fa fa-exclamation-triangle', color: '#ffbf00' }
}
function notice (args) {
  const outerPrefixCls = args.prefixCls || 'coding-notification'
  const prefixCls = `${outerPrefixCls}-notice`
  const duration = args.duration === undefined ? defaultDuration : args.duration
  let iconNode = null
  if (args.icon) {
    iconNode = React.createElement('span', { className: `${prefixCls}-icon` }, args.icon)
  } else if (args.type) {
    const iconType = typeToIcon[args.type]
    iconNode = (
      <span style={{ color: iconType.color }} className={`${prefixCls}-icon`}>
        <i className={iconType.className} aria-hidden='true' />
      </span>
    )
  }
  const autoMarginTag =
    !args.description && iconNode
      ? React.createElement('span', { className: `${prefixCls}-message-single-line-auto-margin` })
      : null
  getNotificationInstance(outerPrefixCls, args.placement || defaultPlacement).notice({
    content: React.createElement(
      'div',
      { className: iconNode ? `${prefixCls}-with-icon` : '' },
      iconNode,
      args.message
        ? React.createElement(
            'div',
            { className: `${prefixCls}-message` },
            autoMarginTag,
            args.message
          )
        : null,
      React.createElement('div', { className: `${prefixCls}-description` }, args.description),
      args.btn ? React.createElement('span', { className: `${prefixCls}-btn` }, args.btn) : null
    ),
    duration,
    closable: true,
    onClose: args.onClose,
    closeIcon: <i className='fa fa-close' aria-hidden='true' />,
    key: args.key,
    style: args.style || {},
    className: args.className
  })
}
const api = {
  open: notice,
  close: function close (key) {
    Object.keys(notificationInstance).forEach(cacheKey =>
      notificationInstance[cacheKey].removeNotice(key)
    )
  },

  config: setNotificationConfig,
  destroy: function destroy () {
    Object.keys(notificationInstance).forEach((cacheKey) => {
      notificationInstance[cacheKey].destroy()
      delete notificationInstance[cacheKey]
    })
  }
}
;['success', 'warning', 'error', 'info'].forEach((type) => {
  api[type] = function (args) {
    return api.open(_extends({}, args, { type }))
  }
})
api.warn = api.warning
export default api
