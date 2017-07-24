import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import { findDOMNode } from 'react-dom'

@observer
class ScrollToBottom extends Component {

  constructor (props) {
    super(props)
    this.state = observable({
      unreadCount: 0,
      lastChatCount: this.props.chatCount,
    })
  }

  componentWillUpdate () {
    const node = this.scrollContainer
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight
  }

  componentDidUpdate () {
    if (this.shouldScrollBottom) {
      const node = this.scrollContainer
      // const intervalId = setInterval(() => {
      //   node.scrollTop = node.scrollTop + 10
      //   if ((node.scrollTop + node.offsetHeight) >= node.scrollHeight) {
      //     clearInterval(intervalId)
      //   }
      // }, 50)
      setTimeout(() => node.scrollTop = node.scrollHeight - node.offsetHeight, 0)
      this.state.unreadCount = 0
    } else if (this.props.chatCount > this.state.lastChatCount) {
      this.state.unreadCount += (this.props.chatCount - this.state.lastChatCount)
    }
    this.state.lastChatCount = this.props.chatCount
  }

  handleScroll = () => {
    const node = this.scrollContainer
    if ((node.scrollTop + node.offsetHeight) >= node.scrollHeight) {
      this.state.unreadCount = 0
    }
  }

  scrollToBottom = () => {
    const node = this.scrollContainer
    node.scrollTop = node.scrollHeight - node.offsetHeight
  }

  render () {
    const { className, children } = this.props
    const style = {
      overflowY: 'scroll',
      ...this.props.style
    }
    return (
      <div className={`${className}`}>
        <div className={`Scroll-To-Bottom scroll-container`} style={style} onScroll={this.handleScroll} ref={dom => this.scrollContainer = dom}>
          {children}
        </div>
        {this.state.unreadCount > 0 && <div className='unread-hint' onClick={this.scrollToBottom}>
          {this.state.unreadCount}
        </div>}
      </div>
    )
  }
}

ScrollToBottom.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  chatCount: PropTypes.number,
}

ScrollToBottom.defaultProps = {}

export default ScrollToBottom
