import React, { Component } from 'react'
import moment from 'moment'
import { inject, observer } from 'mobx-react'
import cx from 'classnames'
import GitGraph from './GitGraph'
import state from './state'
import { CommitsCrawler, fetchCommits, fetchRefs } from './actions'

const RefTag = ({ value: refName, backgroundColor, borderColor }) => {
  let ref
  const regex = /(refs\/\w+\/|HEAD)(.*)/
  const match = regex.exec(refName) || []
  switch (match[1]) {
    case 'refs/heads/':
      ref = { type: 'local', name: match[2], icon: 'git-branch' }
      break
    case 'refs/remotes/':
      ref = { type: 'remote', name: match[2], icon: 'git-branch' }
      break
    case 'refs/tags/':
      ref = { type: 'tag', name: match[2], icon: 'tag' }
      break
    case 'HEAD':
      ref = { type: 'head', name: 'HEAD', icon: 'tag' }
      break
    default:
      ref = false
  }

  if (!ref) return null
  return (
    <div className='git-graph-ref' style={{ backgroundColor, borderColor }} >
      <i className={'octicon octicon-' + ref.icon} />{ref.name}
    </div>
  )
}

@inject(() => {
  return {
    commitsState: state.commitsState,
    commits: Array.from(state.commitsState.commits.values()),
  }
})
@observer
class GitGraphTable extends Component {
  constructor (props) {
    super(props)
    fetchRefs()
    const PAGE_SIZE = 30
    fetchCommits({ size: PAGE_SIZE, page: 0 })
    this.state = {
      radius: 4,
      colWidth: 10,
      rowHeight: 25,
      selectedRowIndex: -1,
      viewSize: 'small',
    }

    this.crawler = new CommitsCrawler({
      commits: state.rawCommits,
      size: PAGE_SIZE,
    })
  }

  toggleViewSize = (smallOrLarge) => {
    if (!smallOrLarge) smallOrLarge = this.state.viewSize === 'small' ? 'large' : 'small'
    switch (smallOrLarge) {
      case 'large':
        this.setState({ viewSize: 'large', rowHeight: 50 })
        break
      case 'small':
      default:
        this.setState({ viewSize: 'small', rowHeight: 25 })
    }
  }

  onVerticalScroll = () => {
    const elt = this.wrapperDOM
    if (!elt) return
    const distanceToScrollBottom = elt.scrollHeight - elt.offsetHeight - elt.scrollTop
    if (distanceToScrollBottom < this.state.rowHeight * this.crawler.size / 2) {
      this.crawler.fetch()
    }
  }

  render () {
    const { radius, colWidth, rowHeight } = this.state
    const { commits, commitsState }  = this.props
    return (
      <div className='git-logs-view'
        ref={r => this.wrapperDOM = r}
        onScroll={this.onVerticalScroll}
      >
        <div className='git-logs-table'>
          <div className='git-graph-wrapper'>
            <GitGraph
              commitsState={commitsState}
              circleRadius={radius}
              colWidth={colWidth}
              rowHeight={rowHeight}
            />
          </div>

          {commits.map((commit, commitIndex) =>
            this.state.viewSize === 'large' ?
              (<div className={cx('flex-row view-size-large', {
                  selected: this.state.selectedRowIndex === commitIndex
                })}
                style={{
                  height: rowHeight,
                  paddingLeft: (commitsState.livingLaneIdsAtIndex[commitIndex].length + 2) * colWidth,
                }}
                onClick={() => this.setState({ selectedRowIndex: commitIndex })}
              >
                <div className='avatar'>
                  <img className='avatar-img' src={
                    `https://api.adorable.io/avatars/50/${commit.author.name}.png`
                  } />
                </div>
                <div className='commit-data'>
                  <div className='commit-data-row'>
                    <div className='author' title={`${commit.author.name} <${commit.author.emailAddress}>`}>
                      {commit.author.name}
                    </div>
                    {commit.refs.map(ref =>
                      <RefTag key={ref}
                        value={ref}
                        backgroundColor={commit.lane.backgroundColor}
                        borderColor={commit.lane.borderColor}
                      />
                    )}
                    <div className='date' title={moment(commit.date, 'X').format('YYYY/MM/DD HH:mm:ss')}>
                      {moment(commit.date, 'X').format('YYYY/MM/DD')}
                    </div>
                  </div>
                  <div className='commit-data-row'>
                    <div className='sha1'>{commit.shortId}</div>
                    <div className='message message-text'>{commit.message}</div>
                  </div>
                </div>
              </div>)

            : (<div className={cx('flex-row view-size-small', {
                  selected: this.state.selectedRowIndex === commitIndex
                })}
                style={{
                  height: rowHeight,
                  paddingLeft: (commitsState.livingLaneIdsAtIndex[commitIndex].length + 2) * colWidth,
                }}
                onClick={() => this.setState({ selectedRowIndex: commitIndex })}
              >
                <div className='sha1'>{commit.shortId}</div>
                <div className='message' title={commit.message}>
                  {commit.refs.map(ref =>
                    <RefTag key={ref}
                      value={ref}
                      backgroundColor={commit.lane.backgroundColor}
                      borderColor={commit.lane.borderColor}
                    />
                  )}
                  <div className='message-text'>{commit.message}</div>
                </div>
                <div className='author' title={`${commit.author.name} <${commit.author.emailAddress}>`}>
                  {commit.author.name}
                </div>
                <div className='date' title={moment(commit.date, 'X').format('MM/DD/YYYY HH:mm:ss')}>
                  {moment(commit.date, 'X').format('MM/DD/YYYY')}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    )
  }
}

export default GitGraphTable
