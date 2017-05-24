import React, { Component } from 'react'
import PropTypes from 'prop-types'

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

  render () {
    const { commits, circleRadius, colWidth, rowHeight } = this.props
    const posX = col => (col + 1) * colWidth
    const posY = row => (row + 1) * rowHeight - rowHeight / 2
    const pathProps = { strokeWidth: 2, fill: 'none' }

    let pathsList = []
    let circlesList = []
    let maxCol = 0
    commits.forEach((commit, commitIndex) => {
      maxCol = Math.max(maxCol, commit.col)

      const x = posX(commit.col)
      const y = posY(commitIndex)

      // draw path from current commit to its children
      const paths = commit.children.map((child) => {
        const childIndex = commits.indexOf(child)
        const pathKey = `p_${commit.id}_${child.id}`

        let d, strokeColor
        // case 1: child on the same col, draw a straight line
        if (child.col === commit.col) {
          d = pathData()
            .moveTo(x, y)
            .lineTo(posX(child.col), posY(childIndex))
            .value()
          strokeColor = child.branch.color
        }
        // case 2: child has one parent, that's a branch out
        else if (child.parentIds.length === 1) {
          d = pathData()
            .moveTo(x, y)
            .lineTo(posX(child.col), y - rowHeight/2)
            .lineTo(posX(child.col), posY(childIndex))
            .value()
          strokeColor = child.branch.color
        }
        // case 3: child has more than one parent
        else {
          // case 3-1: if current commit is base of merge, that's a branch out, too
          if (commit.isBaseOfMerge(child)) {
            d = pathData()
              .moveTo(x, y)
              .lineTo(posX(child.col), y - rowHeight/2)
              .lineTo(posX(child.col), posY(childIndex))
              .value()
            strokeColor = child.branch.color
          }
          // case 3-2: other than that, it's a merge
          else {
            d = pathData()
              .moveTo(x, y)
              .lineTo(x, posY(childIndex) + rowHeight/2)
              .lineTo(posX(child.col), posY(childIndex))
              .value()
            strokeColor = commit.branch.color
          }
        }

        return <path d={d} id={pathKey} key={pathKey} stroke={strokeColor} {...pathProps} />
      })

      const circle = (
        <circle
          key={`c_${commit.id}`}
          cx={x} cy={y} r={circleRadius}
          fill={commit.branch.color}
          strokeWidth='1'
          stroke='#fff'
        />)

      pathsList = paths.concat(pathsList)
      circlesList = circlesList.concat(circle)
    })

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
const branchType = shape({ color: string.isRequired })

const commitShapeConfig = {
  id: string.isRequired,
  col: number.isRequired,
  branch: branchType,
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
