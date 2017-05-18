import React, { Component } from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'
import gitgraph from 'gitgraph.js'

import state, { genData } from './mockData'

const pathData = () => {
  return {
    data: [],
    moveTo (x, y) {
      this.data.push(`M${x},${y}`)
      return this
    },
    lineTo (x, y) {
      this.data.push(`L${x},${y}`)
      return this
    },
    value () {
      return this.data.join('')
    }
  }
}

@observer
class GitGraph extends Component {
  constructor () {
    super()
    genData()
  }

  draw () {
    // case 1 child and that child has 1 parent, which is commit itself

    // case 1 child and that child has multiple parents, which indicates a merge
  }

  // componentDidMount () {
  //   const ctx = this.ctx = this.canvasEl.getContext('2d')
  //   state.commitList.forEach(commit => {
  //     commit
  //   })
  // }

  render () {
    const graphWidth = 70
    // <canvas ref={r=>this.canvasEl=r} style={{ position: 'absolute', left: 0, top: 0, width: graphWidth+'px', height: state.commitList.length * 13 + 'px', border: '1px solid darkblue' }}></canvas>
    const style={ paddingLeft: graphWidth+'px', position: 'relative' }

    const radius = 4
    const spacingX = 10
    const spacingY = 13
    const posX = (col) => col * spacingX + radius + 1
    const posY = (row) => row * spacingY + radius + 1

    return (
      <div>
        <table>
          <tbody>
          <tr>
            <td rowSpan='999999' style={{paddingTop: spacingY+2+'px'}} >
            <svg height={state.commitList.length * 13} width={10 * (state.maxCol + 1) + 10}>
              {state.commitList.map((commit, idx) => {
                const x = posX(commit.col)
                const y = posY(commit.index)

                const pathProps = {
                  strokeWidth: 2,
                  strokeOpacity: 1,
                  opacity: 1,
                  fill: 'none',
                }

                // draw path to children
                let paths = []
                paths = commit.children.map(child => {
                  // case 1: child on the same col, draw a straight line
                  if (child.col === commit.col) {
                    const d = pathData()
                      .moveTo(x, y)
                      .lineTo(posX(child.col), posY(child.index))
                      .value()
                    return <path d={d} {...pathProps} stroke={child.branch.color} ></path>
                  } else {
                  // case 2: child on different col
                    // case 2-1: child has one parent, that's a branch out
                    if (child.parentIds.length === 1) {
                      const d = pathData()
                        .moveTo(x, y)
                        .lineTo(posX(child.col), y - spacingY/2)
                        .lineTo(posX(child.col), posY(child.index))
                        .value()
                      return <path d={d} {...pathProps} stroke={child.branch.color} ></path>
                    } else {
                    // case 2-2: child has more than one parent, that's a merge
                      const d = pathData()
                        .moveTo(x, y)
                        .lineTo(x, posY(child.index) + spacingY/2)
                        .lineTo(posX(child.col), posY(child.index))
                        .value()
                      return <path d={d} {...pathProps} stroke={commit.branch.color} ></path>
                    }
                  }
                })

                return [
                  ...paths,
                  <circle cx={x} cy={y} r={radius} fill={commit.branch.color} stroke='none'></circle>,
                ]
              })}
            </svg>
            </td>
            <th>SHA1</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
          {state.commitList.map(commit =>
            <CommitListItem commit={commit} key={commit.shortId} maxCol={state.maxCol}/>
          )}
          </tbody>
        </table>
      </div>
    )
  }
}

@observer
class CommitListItem extends Component {
  render () {
    const { commit } = this.props

    return (
      <tr>
        <td style={{color: 'green'}}>{commit.shortId}</td>
        <td>{commit.message}</td>
        <td>{moment(commit.date, 'X').format('YYYY/MM/DD HH:mm:ss')}</td>
      </tr>
    )
  }
}

export default GitGraph


// <td>{commit.leafChildren.map(leafChild =>
//           <span>{leafChild.shortId}</span>
//         )}</td>
