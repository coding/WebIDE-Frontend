import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CommitsState from './helpers/CommitsState'

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
        this.data.pop()  // pluck the second last pos, it's useless
        this.data.push(last)
      }
      return this
    },

    value () {
      return this.data.reduce((acc, [x, y], index) => {
        if (index === 0) {
          acc += `M${x},${y}`
        } else {
          acc += `L${x},${y}`
        }
        return acc
      }, '')
    }
  }
  if (typeof startX === 'number' && typeof startY === 'number') {
    obj.push(startX, startY)
  }

  return obj
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

  getColFactory = (livingLaneIdsAtIndex) => (commitOrIndex, laneId) => {
    let index, commit
    if (typeof commitOrIndex === 'object') {
      commit = commitOrIndex
      index = commit.index
      laneId = commit.laneId
    } else {
      index = commitOrIndex
    }
    return livingLaneIdsAtIndex[index].indexOf(laneId)
  }

  render () {
    const orphanage = new Map() // a place to shelter children who haven't found their parents yet
    const laneColTracker = this.laneColTracker = []

    const state = this.commitsState = new CommitsState(this.props.commits)
    const getCol = this.getColFactory(state.livingLaneIdsAtIndex)

    const commits = Array.from(state.commits.values())
    const { circleRadius, colWidth, rowHeight } = this.props
    const { posX, posY } = this

    const pd = pdFactory(rowHeight / 2)

    let pathsList = []
    let circlesList = []
    let maxCol = 0

    commits.forEach((commit, commitIndex) => {
      commit.col = getCol(commit)
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

        let d, strokeColor, pathLaneId, isMerged = false
        switch (PATH_TYPE) {
          case 'normal':
            strokeColor = child.lane.color
            pathLaneId = child.laneId
            break
          case 'diverged':
            strokeColor = child.lane.color
            pathLaneId = child.laneId
            break
          case 'merged':
            strokeColor = commit.lane.color
            pathLaneId = commit.laneId
            isMerged = true
            break
        }

        d = pd().push(x, y)

        for (let i = commitIndex - 1; i >= childIndex; i--) {
          let colAtIndex = getCol(i, pathLaneId)
          if (colAtIndex === -1) {
            colAtIndex = state.livingLaneIdsAtIndex[i].length
            state.livingLaneIdsAtIndex[i].push(pathLaneId) // <-- this mutate the livingLaneIdsAtIndex record, but it needs to be done,
          }
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
