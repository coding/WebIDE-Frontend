import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { observer } from 'mobx-react'
import GitGraph from './GitGraph'
import state, { genData } from './mockData'

@observer
class CommitListItem extends Component {
  render () {
    const { commit, rowHeight } = this.props
    return (
      <tr style={{ height: rowHeight }} >
        <td style={{color: 'green'}}>{commit.shortId}</td>
        <td>{commit.message}</td>
        <td>{moment(commit.date, 'X').format('YYYY/MM/DD HH:mm:ss')}</td>
      </tr>
    )
  }
}

@observer
class GitGraphTable extends Component {
  constructor () {
    super()
    genData()
    this.state = {
      radius: 4,
      colWidth: 10,
      rowHeight: 27,
    }
  }

  render () {
    const { radius, colWidth, rowHeight } = this.state
    return (
      <table>
        <tbody>
        <tr>
          <th>Graph</th>
          <th>SHA1</th>
          <th>Message</th>
          <th>Date</th>
        </tr>
        <tr>
          <td rowSpan='999999' style={{ verticalAlign: 'top' }} >
            <GitGraph
              commits={state.commitList}
              circleRadius={radius}
              colWidth={colWidth}
              rowHeight={rowHeight}
            />
          </td>
        </tr>
        {state.commitList.map(commit =>
          <CommitListItem
            key={commit.shortId}
            commit={commit}
            maxCol={state.maxCol}
            rowHeight={rowHeight}
          />
        )}
        </tbody>
      </table>
    )
  }
}

export default GitGraphTable
