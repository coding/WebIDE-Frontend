import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { observer, inject } from 'mobx-react'
import { Table, Column, Cell } from 'fixed-data-table-2'
import { emitter, E } from 'utils'
import GitGraph from './GitGraph'
import state from './state'
import cx from 'classnames'
import { hex2rgb } from './helpers'
import { fetchRefs, fetchCommits } from './actions'
import ResizeBar from 'components/ResizeBar'

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

const TextCell = ({ rowIndex, selectedRow, children, ...otherProps }) => {
  return (
    <Cell className={cx({selected: rowIndex == selectedRow})}
      style={{ whiteSpace: 'nowrap' }}
      {...otherProps}
    >
      {children}
    </Cell>
  )
}

@inject(() => ({ commits: state.commitsList }))
@observer
class GitGraphTable extends Component {
  constructor () {
    super()
    fetchRefs()
    fetchCommits({ size: 30, page: 0 })
    this.state = {
      radius: 4,
      colWidth: 10,
      rowHeight: 27,
      tableHeight: 0,
      tableWidth: 0,
      gitGraphWidth: 0,
      gitGraphColumnSize: 10,
      gitLogTableSize: 90,
      scrollTop: 0,
      columnWidths: {
        message: 600,
        sha1: 100,
        author: 300,
        date: 200,
      }
    }
  }

  onColumnResizeEndCallback = (newColumnWidth, columnKey) => {
    this.setState(({ columnWidths }) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth,
      }
    }))
  }

  componentWillMount () {
    emitter.on(E.PANEL_RESIZED, this.resizeView)
  }

  componentDidMount () {
    this.resizeView()
  }

  componentWillUnmount () {
    emitter.removeListener(E.PANEL_RESIZED, this.resizeView)
  }

  resizeView = () => {
    setTimeout(() => {
      if (this.containerDOM.clientWidth > 0) {
        this.setState({
          tableHeight: this.containerDOM.clientHeight - 22,
          tableWidth: this.gitLogTableContainerDOM.clientWidth
        })
      }
    }, 0)
  }

  syncGitGraphScrollTop = (scrollTop) => {
    this.setState({ scrollTop })
    if (this.gitGraphContainerDOM.scrollTop !== scrollTop) {
      this.gitGraphContainerDOM.scrollTop = scrollTop
    }
  }

  onVerticalScroll = (scrollTop) => {
    const commits = this.props.commits
    this.syncGitGraphScrollTop(scrollTop)

    if (this.isFetching) return this.isFetching
    const revealedOffset = scrollTop + this.containerDOM.clientHeight
    if (revealedOffset > this.state.rowHeight * (commits.length - 20)) {
      const size = 30
      const page = Math.floor(commits.length / size)
      this.isFetching = fetchCommits({ size, page })
        .catch(() => true) // don't care error, just let crash and retry
        .then(() => this.isFetching = false)
    }
  }

  onRowClick = (e, rowIndex/*, rowData*/) => {
    this.setState({ selectedRow: rowIndex })
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
      <div className='ide-history' ref={r => this.containerDOM = r} >
        <div className='history-container'>
          <div className='history-title'>Git Logs</div>
          <div className='history-table' >

            <div id='git-graph-column' style={{ flexGrow: this.state.gitGraphColumnSize }} >
              <div className='column-header'>Graph</div>
              <div className='column-content' ref={r => this.gitGraphContainerDOM = r}
                onScroll={e => this.onVerticalScroll(e.target.scrollTop)}
              >
                <GitGraph
                  commits={commits}
                  circleRadius={radius}
                  colWidth={colWidth}
                  rowHeight={rowHeight}
                  onWidthChange={this.onGitGraphWidthChange}
                />
              </div>
              <ResizeBar
                parentFlexDirection='row'
                viewId='git-graph-column'
                confirmResize={this.confirmResize}
              />
            </div>

            <div id='git-log-table' ref={r => this.gitLogTableContainerDOM = r} style={{ flexGrow: this.state.gitLogTableSize }} >
              <Table
                rowsCount={commits.length}
                rowHeight={rowHeight}
                headerHeight={rowHeight}
                maxHeight={this.state.tableHeight}
                width={this.state.tableWidth}
                height={this.state.tableHeight}
                onColumnResizeEndCallback={this.onColumnResizeEndCallback}
                onVerticalScroll={this.onVerticalScroll}
                onRowClick={this.onRowClick}
                scrollTop={this.state.scrollTop}
                isColumnResizing={false}
              >
                <Column
                  columnKey='message'
                  header='Message'
                  width={this.state.columnWidths.message}
                  cell={({ rowIndex, ...otherProps }) =>
                    <TextCell rowIndex={rowIndex}
                      selectedRow={this.state.selectedRow}
                      {...otherProps}
                    >
                      {commits[rowIndex].refs.map(
                        ref => <RefTag value={ref} key={ref} color={commits[rowIndex].branch.color} />
                      )}
                      {commits[rowIndex].message}
                    </TextCell>
                  }
                  isResizable
                />

                <Column
                  columnKey='sha1'
                  header='Commit'
                  width={this.state.columnWidths.sha1}
                  cell={({ rowIndex, ...otherProps }) =>
                    <TextCell rowIndex={rowIndex}
                      selectedRow={this.state.selectedRow}
                      {...otherProps}
                    >
                      {commits[rowIndex].shortId}
                    </TextCell>
                  }
                  isResizable
                />

                <Column
                  columnKey='author'
                  header='Author'
                  width={this.state.columnWidths.author}
                  cell={({ rowIndex, ...otherProps }) =>
                    <TextCell rowIndex={rowIndex}
                      selectedRow={this.state.selectedRow}
                      {...otherProps}
                    >
                      {commits[rowIndex].author.name} &lt;{commits[rowIndex].author.emailAddress}&gt;
                    </TextCell>
                  }
                  isResizable
                />

                <Column
                  columnKey='date'
                  header='Date'
                  width={this.state.columnWidths.date}
                  cell={({ rowIndex, ...otherProps }) =>
                    <TextCell rowIndex={rowIndex}
                      selectedRow={this.state.selectedRow}
                      {...otherProps}
                    >
                      {moment(commits[rowIndex].date, 'X').format('YYYY-MM-DD HH:mm')}
                    </TextCell>
                  }
                  isResizable
                />
              </Table>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default GitGraphTable
