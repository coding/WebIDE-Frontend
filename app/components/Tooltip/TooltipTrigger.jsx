import React, { Component } from 'react'
import is from 'utils/is'
import PropTypes from 'prop-types'
import { addTooltip, removeTooltip } from './state'

class TooltipTrigger extends Component {
  static defaultProps = {
    placement: 'top',
  }

  static propTypes = {
    placement: PropTypes.string,
    shouldShow: PropTypes.func,
    children: PropTypes.any,
    content: PropTypes.any,
  }

  onMouseOver = (e) => {
    const tooltipProps = this.getTooltipProps()
    if (!tooltipProps) return
    const tooltip = addTooltip(tooltipProps)
    e.stopPropagation()
    const dismissTooltip = (e) => {
      removeTooltip(tooltip)
      window.removeEventListener('mouseover', dismissTooltip)
    }
    window.addEventListener('mouseover', dismissTooltip)
  }

  getTooltipProps () {
    if (is.function(this.props.shouldShow) && this.props.shouldShow() === false) return null
    return {
      rect: this.dom.getBoundingClientRect(),
      placement: this.props.placement,
      content: this.props.content,
    }
  }

  render () {
    const childrenCount = React.Children.count(this.props.children)
    if (childrenCount === 1) {
      return React.cloneElement(this.props.children, {
        ref: r => this.dom = r,
        onMouseOver: this.onMouseOver,
      })
    }
    return null
  }
}

export default TooltipTrigger
