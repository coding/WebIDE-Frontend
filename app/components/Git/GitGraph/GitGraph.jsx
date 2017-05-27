import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CommitsState from './helpers/CommitsState'

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

class GitGraph extends Component {
  constructor (props) {
    super(props)
    this.commitsCount = 0
    if (props.commits && props.commits.length) {
      this.commitsCount = props.commits.length
    }
  }

  shouldComponentUpdate () {
    if (this.commitsCount === this.props.commits.length) {
      return false
    } else {
      this.commitsCount = this.props.commits.length
      return true
    }
  }

  posX = (col) => (col + 1) * this.props.colWidth
  posY = (row) => (row + 0.5) * this.props.rowHeight

  renderOrphansPathes (orphans, lastIndex) {
    const posX = this.posX
    const posY = this.posY
    const paths = orphans.map(orphan => {
      const strokeColor = orphan.lane.color
      const d = pathData()
        .moveTo(posX(orphan.lane.col), posY(lastIndex))
        .lineTo(posX(orphan.lane.col), posY(orphan.index))
        .value()
      const pathKey ='future_' + orphan.id
      return <path id={pathKey} key={pathKey} d={d} stroke={strokeColor} strokeWidth='2' fill='none' />
    })

    return paths
  }

  render () {
    const orphanage = new Map() // a place to shelter children who haven't found their parents yet
    let commits = this.props.commits
    const state = new CommitsState(commits)
    commits = Array.from(state.commits.values())
    const { circleRadius, colWidth, rowHeight } = this.props
    const posX = this.posX
    const posY = this.posY
    const pathProps = { strokeWidth: 2, fill: 'none' }

    let pathsList = []
    let circlesList = []
    let maxCol = 0
    commits.forEach((commit, commitIndex) => {
      if (!commit.isRoot) {
        // register parent count of this commit
        orphanage.set(commit.id, commit.parentIds.length)
      }
      maxCol = Math.max(maxCol, commit.col)

      const x = posX(commit.col)
      const y = posY(commitIndex)

      // draw path from current commit to its children
      const paths = commit.children.map((child) => {
        if (orphanage.has(child.id)) {
          const parentCount = orphanage.get(child.id) - 1
          if (parentCount <= 0) {
            orphanage.delete(child.id)
          } else {
            orphanage.set(child.id, parentCount)
          }
        }

        const childIndex = commits.indexOf(child)
        const pathKey = `p_${commit.shortId}_${child.shortId}`

        // SPOTLIGHT on each CHILD!!!
        // we decide what type of connection this path is
        let PATH_TYPE
        // case 1: child and commit on same lane
        if (child.laneId === commit.laneId) PATH_TYPE = 'normal'
        // case 2: child has only one parent
        else if (child.parentIds.length === 1) PATH_TYPE = 'diverged'
        // case 3: child has multi-parents, but commit is base of merge
        // this case almost always emerge only at a PR merge
        else if (commit.isBaseOfMerge(child)) PATH_TYPE = 'diverged'
        else PATH_TYPE = 'merged'

        let d, strokeColor
        switch (PATH_TYPE) {
          case 'normal':
            strokeColor = child.lane.color
            d = pathData()
              .moveTo(x, y)
              .lineTo(posX(child.col), posY(childIndex))
              .value()
            break
          case 'diverged':
            strokeColor = child.lane.color
            // prefer switch lane first, then go straight
            d = pathData()
              .moveTo(x, y)
              .lineTo(posX(child.col), y - rowHeight/2)
              .lineTo(posX(child.col), posY(childIndex))
              .value()
            break
          case 'merged':
            strokeColor = commit.lane.color
            // prefer go straight first, then switch lane
            d = pathData()
              .moveTo(x, y)
              .lineTo(x, posY(childIndex) + rowHeight/2)
              .lineTo(posX(child.col), posY(childIndex))
              .value()
            break
        }

        return <path d={d} id={pathKey} key={pathKey} stroke={strokeColor} {...pathProps} />
      })

      const circle = (
        <circle
          key={`c_${commit.id}`}
          cx={x} cy={y} r={circleRadius}
          fill={commit.lane.color}
          strokeWidth='1'
          stroke='#fff'
        />)

      pathsList = paths.concat(pathsList)
      circlesList = circlesList.concat(circle)
    })

    const orphans = Array.from(orphanage.keys()).map(id => state.commits.get(id))
    pathsList = pathsList.concat(this.renderOrphansPathes(orphans, commits.length))
    const width = colWidth * (maxCol + 2)
    if (typeof this.props.onWidthChange === 'function') this.props.onWidthChange(width)

    return (
      <svg height={commits.length * rowHeight} width={colWidth * (maxCol + 2)} >
        {[...pathsList, ...circlesList]}
      </svg>
    )
  }
}


const { string, number, arrayOf, shape, } = PropTypes
const laneType = shape({ color: string.isRequired })

const commitShapeConfig = {
  id: string.isRequired,
  col: number.isRequired,
  lane: laneType,
}

const commitType = shape({
  ...commitShapeConfig,
  children: arrayOf(shape(commitShapeConfig)),
})

GitGraph.propTypes = {
  commits: arrayOf(commitType).isRequired,
  circleRadius: number.isRequired,
  colWidth: number.isRequired,
  rowHeight: number.isRequired,
}

export default GitGraph
