import React, { Component } from 'react'
import moment from 'moment'
import { inject, observer } from 'mobx-react'
import { Cell, Column, Table } from 'fixed-data-table-2'
import { E, emitter } from 'utils'
import GitGraph from './GitGraph'
import state from './state'
import cx from 'classnames'
import ResizeBar from 'components/ResizeBar'
import { hex2rgb } from './helpers'
import CommitsState from './helpers/CommitsState'
import { CommitsCrawler, fetchCommits, fetchRefs } from './actions'

const RefTag = ({ value: refName, color }) => {
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

  const rgb = hex2rgb(color)
  const rgbaColorStr = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`
  return (
    <span className='git-graph-ref' style={{ backgroundColor: rgbaColorStr }} >
      <i className={'octicon octicon-' + ref.icon} />{ref.name}
    </span>
  )
}

const TextCell = ({ rowIndex, selectedRow, children, ...otherProps }) => (
  <Cell className={cx({ selected: rowIndex === selectedRow })}
    style={{ whiteSpace: 'nowrap' }}
    {...otherProps}
  >
    {children}
  </Cell>
)

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
      rowHeight: 27,
      tableHeight: 0,
      tableWidth: 0,
      gitGraphWidth: 0,
      gitGraphColumnSize: 5,
      gitLogTableSize: 95,
      scrollTop: 0,
      columnWidths: {
        message: 600,
        sha1: 100,
        author: 300,
        date: 200,
      }
    }

    this.crawler = new CommitsCrawler({
      commits: state.rawCommits,
      size: PAGE_SIZE,
    })
  }

  componentWillMount () {
    emitter.on(E.PANEL_RESIZED, this.onVerticalScroll)
  }

  componentWillUnmount () {
    emitter.removeListener(E.PANEL_RESIZED, this.onVerticalScroll)
  }

  onVerticalScroll = () => {
    const elt = this.wrapperDOM
    if (!elt) return
    const distanceToScrollBottom = elt.scrollHeight - elt.offsetHeight - elt.scrollTop
    if (distanceToScrollBottom < this.state.rowHeight * this.crawler.size / 2) {
      this.crawler.fetch()
    }
  }

  onGitGraphWidthChange = (width) => {
    if (this.state.gitGraphWidth !== width) {
      setTimeout(() => {
        this.setState({ gitGraphWidth: width })
      })
    }
  }

  confirmResize = (leftViewDomId, leftSize, rightViewDomId, rightSize) => {
    this.setState({
      gitGraphColumnSize: leftSize,
      gitLogTableSize: rightSize,
    })
  }

  render () {
    const { radius, colWidth, rowHeight } = this.state
    const commits = this.props.commits
    return (
      <div className='git-graph-wrapper'
        ref={r => this.wrapperDOM = r}
        onScroll={this.onVerticalScroll}
      >
        <table>
          <tbody>
          <tr>
            <td rowSpan='999999' style={{ verticalAlign: 'top' }} >
              <GitGraph
                commitsState={this.props.commitsState}
                circleRadius={radius}
                colWidth={colWidth}
                rowHeight={rowHeight}
                onWidthChange={this.onGitGraphWidthChange}
              />
            </td>
          </tr>
          {commits.map(commit =>
            <tr style={{ height: rowHeight }} key={commit.shortId} >
              <td className='sha1' >{commit.shortId}</td>
              <td className='message'>
                {commit.refs.map(ref =>
                  <RefTag value={ref} key={ref} color={commit.lane.color} />
                )}
                {commit.message}
              </td>
              <td className='author' >{commit.author.name}</td>
              <td className='date' >{moment(commit.date, 'X').format('MM/DD/YYYY HH:mm:ss')}</td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    )
  }
}

export default GitGraphTable
