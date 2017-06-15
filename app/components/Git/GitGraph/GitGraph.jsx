import React, { Component } from 'react'
import PropTypes from 'prop-types'
import roundVertices from './helpers/roundVertices'

const pdFactory = halfRowHeight => () => {
  const obj = {
    data: [],
    push (x, y, isMerged) {
      if (this.data.length === 0) {
        this.data.push([x, y])
        return this
      }

      const lastPos = this.data[this.data.length - 1]
      if (lastPos[0] !== x) {
        if (isMerged) { // prefer go straight first, then switch lane
          this.data.push([lastPos[0], lastPos[1] - halfRowHeight])
          this.data.push([x, y])
        } else { // prefer switch lane first, then go straight
          this.data.push([x, lastPos[1] - halfRowHeight])
          this.data.push([x, y])
        }
      } else {
        this.data.push([x, y])
      }

      const length = this.data.length

      if (length >= 3 && this.data[length - 1][0] === this.data[length - 2][0] === this.data[length - 3][0]) {
        const last = this.data.pop()
        this.data.pop()  // pluck the second to last pos, it's useless
        this.data.push(last)
      }
      return this
    },

    value () {
      return roundVertices(this.data).reduce((acc, point, index) => {
        if (index === 0) {
          acc += `M${point[0]},${point[1]}`
        } else if (point.length === 2) {
          acc += `L${point[0]},${point[1]}`
        } else {
          const [x_s, y_s] = point[0] // startPoint
          const [x_c, y_c] = point[1] // ctrlPoint
          const [x_e, y_e] = point[2] // endPoint

          acc += `L${x_s},${y_s}`
          acc += `C${x_c},${y_c},${x_e},${y_e},${x_e},${y_e}`
        }

        return acc
      }, '')
    }
  }

  return obj
}

class GitGraph extends Component {
  shouldComponentUpdate (nextProps) {
    return (
      !this.props.commitsState ||
      this.props.commitsState !== nextProps.commitsState ||
      this.props.rowHeight !== nextProps.rowHeight ||
      this.props.colWidth !== nextProps.colWidth
    )
  }

  posX = (col) => (col + 1) * this.props.colWidth
  posY = (row) => (row + 0.5) * this.props.rowHeight

  render () {
    const orphanage = new Map() // a place to shelter children who haven't found their parents yet

    const state = this.props.commitsState
    const getCol = state.getCol

    const commits = Array.from(state.commits.values())
    const { circleRadius, colWidth, rowHeight } = this.props
    const { posX, posY } = this

    const pd = pdFactory(rowHeight / 2)

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

        let d, strokeColor, pathLaneId, isMerged = false
        switch (commit.relationToChild(child)) {
          case 'NORMAL':
            strokeColor = child.lane.color
            pathLaneId = child.laneId
            break
          case 'DIVERGED':
            strokeColor = child.lane.color
            pathLaneId = child.laneId
            break
          case 'MERGED':
            strokeColor = commit.lane.color
            pathLaneId = commit.laneId
            isMerged = true
            break
        }

        d = pd().push(x, y)

        for (let i = commitIndex - 1; i >= childIndex; i--) {
          let colAtIndex = getCol(i, pathLaneId)
          if (i > childIndex) {
            d.push(posX(colAtIndex), posY(i))
          } else {
            d.push(posX(child.col), posY(childIndex), isMerged)
          }
        }

        d = d.value()

        return (
          <path d={d}
            stroke={strokeColor}
            id={pathKey}
            key={pathKey}
            strokeWidth='2'
            fill='none'
          />
        )
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

    // render orphan pathes
    const orphans = Array.from(orphanage.keys()).map(id => state.commits.get(id))
    const lastIndex = commits.length
    const orphanPaths = orphans.map((orphan) => {
      const strokeColor = orphan.lane.color
      const pathLaneId = orphan.laneId
      const orphanIndex = orphan.index

      let d = pd()
      d.push(posX(getCol(lastIndex - 1, pathLaneId)), posY(lastIndex))
      for (let i = lastIndex - 1; i >= orphanIndex; i--) {
        d.push(posX(getCol(i, pathLaneId)), posY(i))
      }

      d = d.value()
      const pathKey = `future_${orphan.id}`
      return <path id={pathKey} key={pathKey} d={d} stroke={strokeColor} strokeWidth='2' fill='none' />
    })

    // end render orphan pathes
    pathsList = pathsList.concat(orphanPaths)
    const width = colWidth * (maxCol + 2)
    if (typeof this.props.onWidthChange === 'function') this.props.onWidthChange(width)

    return (
      <svg height={commits.length * rowHeight} width={colWidth * (maxCol + 2)} >
        {[...pathsList, ...circlesList]}
      </svg>
    )
  }
}


const { string, number, arrayOf, shape, object } = PropTypes
const laneType = shape({ color: string.isRequired })

const commitShapeConfig = {
  id: string.isRequired,
  lane: laneType,
}

const commitType = shape({
  ...commitShapeConfig,
  children: arrayOf(shape(commitShapeConfig)),
})

GitGraph.propTypes = {
  commitsState: object.isRequired,
  circleRadius: number.isRequired,
  colWidth: number.isRequired,
  rowHeight: number.isRequired,
}

export default GitGraph
